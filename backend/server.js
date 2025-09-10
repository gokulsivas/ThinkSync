// PATH: server.js        (root of backend)

/* ──────────────────────────────────────────────────────────
   ThinkSync Backend – main server entrypoint
   Changes made in this version:
   1.  Mounted NEW profile router at /api/profiles   ← plural
   2.  Updated root endpoint & 404 list accordingly
   3.  Minor comment tweaks; no functional auth edits
   ────────────────────────────────────────────────────────── */

const express = require('express');
const cors     = require('cors');
require('dotenv').config();

console.log('🚀 Starting ThinkSync Backend Server...');

const app  = express();
const PORT = process.env.PORT || 8000;

/* ────────── MIDDLEWARE ────────── */
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use((req, _res, next) => {
  console.log(`📝 ${req.method} ${req.url} – ${new Date().toISOString()}`);
  next();
});

/* ────────── ROUTES ────────── */
app.get('/', (_req, res) => {
  res.json({
    message:   'ThinkSync Backend API is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth:     '/api/auth',
      profiles: '/api/profiles',        // ← plural
      register: '/api/auth/register',
      login:    '/api/auth/login'
    }
  });
});

/* Auth routes */
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes mounted at /api/auth');
} catch (err) {
  console.error('❌ Error loading auth routes:', err.message);
  process.exit(1);
}

/* Profile routes (NEW) */
try {
  app.use('/api/profiles', require('./routes/profile'));  // ← plural
  console.log('✅ Profile routes mounted at /api/profiles');
} catch (err) {
  console.error('❌ Error loading profile routes:', err.message);
  process.exit(1);
}

/* 404 fallback */
app.use('*', (req, res) => {
  console.log(`❌ 404 – ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /api/auth',
      'GET /api/profiles',
      'POST /api/auth/register',
      'POST /api/auth/login'
    ]
  });
});

/* Global error handler */
app.use((err, _req, res, _next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

/* ────────── START SERVER ────────── */
app.listen(PORT, () => {
  console.log('\n🎉 ================================');
  console.log(`🚀 ThinkSync Server running on port ${PORT}`);
  console.log(`🌐 Server URL:  http://localhost:${PORT}`);
  console.log(`🔗 API Base:    http://localhost:${PORT}/api`);
  console.log(`🔐 Auth Routes: http://localhost:${PORT}/api/auth`);
  console.log(`👤 Profile Routes: http://localhost:${PORT}/api/profiles`);
  console.log('🎉 ================================\n');
});

module.exports = app;
