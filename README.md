# Toolkit AI — platform service

Accounts, session, landing page, and admin console for Toolkit AI. Every app service (Scanline, Sealwright once migrated, and anything added later) trusts the session this service issues — see `ARCHITECTURE.md` for the full cross-service contract, Dokploy/Traefik routing setup, database grants, and the checklist for adding a new app.

## Environment variables

Required:
- `DATABASE_URL` — Postgres connection string
- `SESSION_SECRET` — random long string; every app service must use this exact same value
- `APP_BASE_URL` — e.g. `https://tkitai.com` (used to build links inside emails)

Standard runtime:
- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `PORT=8080`

Optional:
- `PGSCHEMA` — defaults to `platform`
- `PGSSL=require` — only if your Postgres needs TLS
- `SMTP_PASS` (a Resend API key), `SMTP_FROM` — without these, the app logs what it would have sent instead of failing

## Local dev

```
npm install
DATABASE_URL=postgres://user:pass@localhost:5432/toolkitai \
SESSION_SECRET=dev \
PORT=8080 HOST=0.0.0.0 node server.js
```

## Structure

- `/` — landing page. Logged out: hero + signup/login. Logged in: a tile per app, from the `APPS` list in `src/routes/portal.js`.
- `/signup`, `/login`, `/logout`, `/forgot-password`, `/reset-password/:token`, `/profile` — account pages, shared by every app.
- `/admin` — user management (the first account created is auto-promoted to admin).
- `/healthz` — checks DB connectivity, returns 200/503.

The `users` table and the shared `session` table (used by every app service) both live in this service's schema and are created automatically on boot.
