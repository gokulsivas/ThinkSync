// PATH: backend/routes/profile.js
// --------------------------------------------------------------
// Endpoints for researcher profiles
//   GET /api/profiles/:userId   → read profile + user’s display name
//   PUT /api/profiles/:userId   → update profile fields
// --------------------------------------------------------------

const express = require('express');
const jwt     = require('jsonwebtoken');
const { Pool } = require('pg');

const router = express.Router();
//const pool   = new Pool();                     // uses .env connection vars
console.log('DB_PASSWORD type:', typeof process.env.DB_PASSWORD);
console.log('DB_PASSWORD value:', process.env.DB_PASSWORD ? '[SET]' : '[EMPTY]');
console.log('All DB vars:', {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD ? '[HIDDEN]' : 'MISSING',
  port: process.env.DB_PORT
});

const SECRET_KEY =
  process.env.JWT_SECRET || 'ThinkSync2025SecureJWTSecretKey';

/* ────────── Optional JWT auth helper (not used below) ────────── */
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
}

/* ────────── GET  /api/profiles/:userId ────────── */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    /* only valid columns; join users for name */
    const { rows } = await pool.query(
      `SELECT
          u.name,
          rp.user_id,
          rp.h_index,
          rp.bio,
          rp.website,
          rp.research_interests,
          rp.awards,
          rp.orcid_id,
          rp.google_scholar_id,
          rp.linkedin_id,
          rp.github_id
         FROM users u
    LEFT JOIN researcher_profiles rp ON rp.user_id = u.user_id
        WHERE u.user_id = $1`,
      [userId]
    );

    if (!rows.length) return res.status(404).json({ message: 'Profile not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[PROFILE] fetch error', err);
    res.status(500).json({ message: err.detail || err.message });
  }
});

/* ────────── PUT  /api/profiles/:userId ────────── */
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const {
    h_index,
    bio,
    website,
    research_interests,
    awards,
    orcid_id,
    google_scholar_id,
    linkedin_id,
    github_id
  } = req.body;

  const sql = `
    UPDATE researcher_profiles SET
      h_index            = $1,
      bio                = $2,
      website            = $3,
      research_interests = $4,
      awards             = $5,
      orcid_id           = $6,
      google_scholar_id  = $7,
      linkedin_id        = $8,
      github_id          = $9,
      updated_at         = NOW()
    WHERE user_id = $10
    RETURNING *;`;

  const values = [
    h_index ?? 0,
    bio,
    website,
    research_interests ?? [],
    awards ?? [],
    orcid_id,
    google_scholar_id,
    linkedin_id,
    github_id,
    userId
  ];

  try {
    const { rows } = await pool.query(sql, values);
    if (!rows.length) return res.status(404).json({ message: 'Profile not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[PROFILE] SQL error', err);
    res.status(500).json({ message: err.detail || err.message });
  }
});

module.exports = router;
