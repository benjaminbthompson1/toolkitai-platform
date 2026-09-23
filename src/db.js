const { Pool } = require('pg');

// The platform gets its own schema in the same shared Postgres instance that
// every app service also connects to — separate schemas, one database.
// This is also where the shared "session" table lives (created lazily by
// connect-pg-simple, see src/session.js) — every app service points its own
// session store at THIS schema by name, via PLATFORM_SCHEMA, so one login
// works across every app without any app owning the users table itself.
const SCHEMA_NAME = process.env.PGSCHEMA || 'platform';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : false,
  options: `-c search_path=${SCHEMA_NAME},public`
});

// Deliberately no "CREATE SCHEMA IF NOT EXISTS" — see the identical note in
// the app services' db.js files. The operator provisions the schema and a
// scoped-down role up front; that role typically lacks database-level
// CREATE privilege, so this statement would fail even when the schema
// already exists (Postgres checks the privilege before checking existence).
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
`;

async function ensureSchema() {
  await pool.query(SCHEMA);
}

module.exports = { pool, ensureSchema, SCHEMA_NAME };
