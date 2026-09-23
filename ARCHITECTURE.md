# Toolkit AI — multi-service architecture

Two repos as of this migration:

- **`toolkitai-platform`** (this repo) — accounts, session, landing page, admin console. Nothing app-specific lives here.
- **`toolkitai-scanline`** — the Scanline app, fully standalone. Trusts the session the platform issues; owns none of the user data itself.

Sealwright has **not** been migrated yet — it keeps running as today's existing monolith (its own repo/service, with `auth.js`, `mailer.js`, its own `db.js`, etc., all still bundled together) until its in-progress edits land. It can move over later using the exact same pattern Scanline just did — see "Migrating Sealwright next" below.

All three (platform, Scanline, and Sealwright-for-now) connect to the **same Postgres instance**, each in its **own schema**. One database, three schemas: `platform`, `scanline`, `sealwright`.

## Why this shape

- A bug in one app's own code, or its own database migration, can no longer take the whole platform down — each service applies its own schema at its own boot.
- Deploying a Scanline fix no longer restarts Sealwright (or the platform), and vice versa.
- Adding app #3 later never touches this repo's routes or Scanline's code — see the checklist at the bottom.

## The one thing every service must agree on: the session

There's no shared code between repos (deliberately — that's what "separate services" means), so the session contract is kept in sync by **convention**, documented once here:

- `SESSION_SECRET` — the exact same value in every service's environment.
- Cookie name — `toolkitai.sid` everywhere (hardcoded in each service's session module, not something you configure).
- Cookie `path` — left at the default `/` everywhere, so it's sent on every path prefix.
- The session table — lives in the `platform` schema, created and owned by the platform service (`createTableIfMissing: true` there only). Every other service points its own session *store* at that same schema/table with `createTableIfMissing: false` — it reads and writes rows there, but never creates the table.

If you ever change the session cookie config in the platform's `src/auth.js`, you must change it identically in every app service's `src/session.js`.

## Path-based routing (Traefik / Dokploy)

All services sit behind one public hostname (`tkitai.com`), routed by **path prefix**, not by subdomain:

| Path | Routes to |
|---|---|
| `/scanline/*` | Scanline service |
| `/sealwright/*` | Sealwright service (unchanged, for now) |
| everything else (`/`, `/login`, `/signup`, `/admin`, ...) | Platform service |

In Dokploy, each service still gets deployed normally (its own app, its own Dockerfile, its own env vars) — the difference is in how you attach its domain. Instead of giving each service the full `tkitai.com` domain, use Dokploy's per-service **path prefix** option (or, if that isn't exposed in the UI for your Dokploy version, add a Traefik router label directly on the service): match `PathPrefix(/scanline)` to the Scanline service, `PathPrefix(/sealwright)` to Sealwright, and the default/catch-all router to the platform service. Only the platform service should claim the bare `/` route.

Because everything shares one hostname, cookies work across all three services automatically — nothing extra needed there.

## Environment variables

**Platform service:**
- `DATABASE_URL` — same Postgres instance as the other services
- `PGSCHEMA` — `platform` (default, can omit)
- `SESSION_SECRET` — shared across every service, see above
- `APP_BASE_URL` — `https://tkitai.com`
- `SMTP_PASS` (Resend API key), `SMTP_FROM` — optional, same as before

**Scanline service:**
- `DATABASE_URL` — same Postgres instance
- `PGSCHEMA` — `scanline` (default, can omit)
- `PLATFORM_SCHEMA` — `platform` (default, can omit) — where its session store looks for the shared session table
- `SESSION_SECRET` — **must match the platform's value exactly**
- `PLATFORM_LOGIN_URL` — only set this if the platform is ever on a different host/subdomain than Scanline; leave unset for the normal same-host path-routed setup (a relative `/login` already resolves correctly)
- `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` — optional, OCR/summarize as before

## Database role privileges

Each service's Postgres role needs different grants:

```sql
-- Platform's role: full control of its own schema (it creates users + session tables)
GRANT ALL ON SCHEMA platform TO platform_role;
GRANT ALL ON ALL TABLES IN SCHEMA platform TO platform_role;

-- Scanline's role: full control of its OWN schema...
GRANT ALL ON SCHEMA scanline TO scanline_role;
GRANT ALL ON ALL TABLES IN SCHEMA scanline TO scanline_role;
-- ...but only read/write (not CREATE) on the platform's session table —
-- it must never be able to create or drop that table, only use it.
GRANT USAGE ON SCHEMA platform TO scanline_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON platform.session TO scanline_role;
```

Run the `GRANT ... ON platform.session` line only *after* the platform service has booted once and created that table (connect-pg-simple creates it lazily, on first use, not at process start) — or just grant `ALL` on the whole `platform` schema to `scanline_role` and tighten it later if that's easier to get running first.

## Verified before shipping

I built both services, installed their real dependencies, and ran them against a real local Postgres — plus a minimal path-routing proxy in front of both, standing in for Traefik — to confirm the actual production topology works, not just the code in isolation:

- Signing up on the platform, then hitting Scanline's dashboard and API with that same cookie, on a **separate process/port**, succeeded — proving the session genuinely shares across services.
- Visiting Scanline while logged out correctly redirected to the platform's `/login?next=/scanline/`, through the shared host.
- Creating a document, listing it, and downloading its assembled PDF worked end-to-end against Scanline's own schema.
- The landing page correctly shows both app tiles from the platform's `APPS` config list.

## Adding app #3 (or #4, #5, ...)

1. New repo, structured like `toolkitai-scanline`: own `server.js`, own `src/db.js` (own schema), own `src/session.js` (copy Scanline's, change nothing but the schema name), own routes, own `Dockerfile`, own `package.json`.
2. New Dokploy service, same `DATABASE_URL` and `SESSION_SECRET` as everything else, its own `PGSCHEMA`.
3. One new Postgres role + schema + grants, matching the pattern above.
4. One new Traefik path-prefix rule.
5. One new entry in the platform's `src/routes/portal.js` `APPS` array (name, url, description, icon).

Nothing else in the platform, Scanline, or any other existing app needs to change.

## Migrating Sealwright next

Same pattern, once you're ready:

1. Split `src/auth.js` — keep the user-CRUD/admin bits only in the platform (already done, this repo); Sealwright gets its own `src/session.js` like Scanline's (copy Scanline's file, no changes needed beyond maybe the schema name it points at, which is already `platform`).
2. Sealwright keeps its own `envelopes`, `envelope_pages`, `signers`, `audit_log`, `envelope_fields`, `saved_signatures` tables in its own `sealwright` schema (it already uses that schema name — no data migration needed, just remove `users` from its `db.js` since that now lives only in `platform`).
3. Drop the `owner_id → users(id)` foreign key in `envelopes` for the same cross-schema reason `scanline_documents.owner_id` doesn't have one — becomes a plain UUID column.
4. Sealwright's signer-facing public routes (`/sealwright/sign/:token`) don't need any session at all today (they're token-based, not login-based) — that part is unaffected by any of this.
5. Move `mailer.js`/`emailTemplates.js` usage: Sealwright's signature-request and completion emails stay in Sealwright's own repo (it has emails no other app sends); only the account-lifecycle emails (welcome, password reset, account-updated) belong to the platform, which already has them.
