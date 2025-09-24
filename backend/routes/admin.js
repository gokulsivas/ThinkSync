const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middleware for admin auth (replace with your real auth logic)
function adminAuth(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
}

// Fetch pending posts for admin approval
router.get('/post_authorizations', adminAuth, async (req, res) => {
  try {
    const query = `
      SELECT p.id, p.user_id, p.content, p.status, p.created_at, u.name as user_name
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'pending'
      ORDER BY p.created_at ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching pending posts:', err);
    res.status(500).json({ error: 'Server error fetching pending posts' });
  }
});

// Approve a post
router.post('/post_authorizations/:id/approve', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const updateQuery = `
      UPDATE posts
      SET status = 'approved', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(updateQuery, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post approved', post: result.rows[0] });
  } catch (err) {
    console.error('Error approving post:', err);
    res.status(500).json({ error: 'Server error approving post' });
  }
});

// Reject a post
router.post('/post_authorizations/:id/reject', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const updateQuery = `
      UPDATE posts
      SET status = 'rejected', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(updateQuery, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post rejected', post: result.rows[0] });
  } catch (err) {
    console.error('Error rejecting post:', err);
    res.status(500).json({ error: 'Server error rejecting post' });
  }
});

module.exports = router;
