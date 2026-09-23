require('dotenv').config();
const express = require('express');
const path = require('path');
const { pool, ensureSchema } = require('./src/db');
const { sessionMiddleware, ensureFirstAdmin } = require('./src/auth');
const portalRouter = require('./src/routes/portal');
const adminRouter = require('./src/routes/admin');

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
app.set('trust proxy', 1); // behind Traefik

app.get('/healthz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'error', error: err.message });
  }
});

app.use('/portal-assets', express.static(path.join(__dirname, 'public/portal')));

app.use(sessionMiddleware());
app.use(express.json());

app.use('/admin', adminRouter);
app.use('/', portalRouter);

async function start() {
  try {
    await ensureSchema();
    console.log('Platform database schema ready.');
    await ensureFirstAdmin();
  } catch (err) {
    console.error('Failed to prepare database schema:', err.message || err.code || String(err));
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
  app.listen(PORT, HOST, () => {
    console.log(`Toolkit AI platform listening on ${HOST}:${PORT}`);
  });
}

start();
