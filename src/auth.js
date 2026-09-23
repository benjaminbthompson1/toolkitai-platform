const crypto = require('crypto');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool, SCHEMA_NAME } = require('./db');

// ============================================================
// THE CROSS-SERVICE CONTRACT
//
// Every app service (Scanline, Sealwright-once-migrated, and any future
// app) runs its own copy of this exact sessionMiddleware() function, from
// its own src/session.js. For one login to work across every app, these
// values must be IDENTICAL across every service's deployment:
//   - SESSION_SECRET (env var — same value everywhere)
//   - the cookie `name` ('toolkitai.sid')
//   - the session table's schema + table name (every service points
//     connect-pg-simple at THIS schema, via PLATFORM_SCHEMA, not its own)
//   - cookie `path` (left at the default '/', so it's sent to every app's
//     path prefix on the same host — do not set a narrower path)
// This platform service is the only one that creates the session table
// (createTableIfMissing: true); every app service sets that to false and
// just reads/writes rows that already exist here.
// ============================================================
function sessionMiddleware() {
  return session({
    store: new pgSession({ pool, schemaName: SCHEMA_NAME, tableName: 'session', createTableIfMissing: true }),
    name: 'toolkitai.sid',
    secret: process.env.SESSION_SECRET || 'dev-only-insecure-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
    }
  });
}

// ---------- password hashing (scrypt — built into Node, no native module to
// compile, which matters on the Alpine build image) ----------
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  try {
    const hashBuffer = Buffer.from(hash, 'hex');
    const suppliedBuffer = crypto.scryptSync(password, salt, 64);
    if (hashBuffer.length !== suppliedBuffer.length) return false;
    return crypto.timingSafeEqual(hashBuffer, suppliedBuffer);
  } catch (e) {
    return false;
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

// ---------- user account helpers ----------
async function findUserByEmail(email) {
  const r = await pool.query('SELECT * FROM users WHERE email=$1', [String(email).trim().toLowerCase()]);
  return r.rows[0] || null;
}

async function findUserById(id) {
  const r = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
  return r.rows[0] || null;
}

async function countUsers() {
  const r = await pool.query('SELECT count(*)::int AS n FROM users');
  return r.rows[0].n;
}

async function createUser(email, password, { firstName, lastName, phone } = {}) {
  const id = crypto.randomUUID();
  const normalizedEmail = String(email).trim().toLowerCase();
  const passwordHash = hashPassword(password);
  await pool.query(
    'INSERT INTO users (id, email, password_hash, first_name, last_name, phone) VALUES ($1,$2,$3,$4,$5,$6)',
    [id, normalizedEmail, passwordHash, firstName || null, lastName || null, phone || null]
  );
  return { id, email: normalizedEmail };
}

async function setResetToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
  await pool.query('UPDATE users SET reset_token=$1, reset_token_expires=$2 WHERE id=$3', [token, expires, userId]);
  return token;
}

async function findUserByValidResetToken(token) {
  const r = await pool.query('SELECT * FROM users WHERE reset_token=$1 AND reset_token_expires > now()', [token]);
  return r.rows[0] || null;
}

async function resetPassword(userId, newPassword) {
  const passwordHash = hashPassword(newPassword);
  await pool.query('UPDATE users SET password_hash=$1, reset_token=NULL, reset_token_expires=NULL WHERE id=$2', [passwordHash, userId]);
}

async function emailTakenByAnotherUser(email, excludeUserId) {
  const r = await pool.query('SELECT 1 FROM users WHERE email=$1 AND id<>$2', [String(email).trim().toLowerCase(), excludeUserId]);
  return r.rows.length > 0;
}

async function updateUserProfile(userId, { firstName, lastName, email, phone }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  await pool.query(
    'UPDATE users SET first_name=$1, last_name=$2, email=$3, phone=$4 WHERE id=$5',
    [firstName || null, lastName || null, normalizedEmail, phone || null, userId]
  );
}

// ---------- admin ----------
// Runs on every boot; a no-op once an admin already exists. Promotes the
// earliest-created account rather than requiring anyone to flip a flag by
// hand.
async function ensureFirstAdmin() {
  const existing = await pool.query('SELECT 1 FROM users WHERE is_admin=true LIMIT 1');
  if (existing.rows.length) return;
  await pool.query(`
    UPDATE users SET is_admin=true
    WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1)
  `);
}

async function listAllUsers() {
  const r = await pool.query(`
    SELECT id, email, first_name, last_name, phone, is_admin, created_at
    FROM users ORDER BY created_at ASC
  `);
  return r.rows;
}

async function deleteUser(id) {
  await pool.query('DELETE FROM users WHERE id=$1', [id]);
}

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  if (req.originalUrl.includes('/api/')) return res.status(401).json({ error: 'Not authenticated' });
  return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
}

async function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) return res.redirect('/login');
  const user = await findUserById(req.session.userId);
  if (!user || !user.is_admin) return res.status(403).send('Not authorized.');
  req.adminUser = user;
  next();
}

module.exports = {
  sessionMiddleware, requireAuth, requireAdmin, isValidEmail,
  hashPassword, verifyPassword,
  findUserByEmail, findUserById, countUsers, createUser,
  setResetToken, findUserByValidResetToken, resetPassword,
  ensureFirstAdmin, listAllUsers, deleteUser,
  emailTakenByAnotherUser, updateUserProfile
};
