const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database');

class AuthService {
  static async register(userData) {
    const { name, email, password, title, affiliation } = userData;
    
    try {
      // Check if user already exists
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      
      if (existingUser.rows.length > 0) {
        throw new Error('User already exists with this email');
      }
      
      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Start transaction
      const client = await db.pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Insert user
        const userResult = await client.query(
          `INSERT INTO users (name, email, password_hash, title, affiliation)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, name, email, title, affiliation, role, created_at`,
          [name, email, passwordHash, title, affiliation]
        );
        
        const user = userResult.rows[0];
        
        // Create researcher profile
        await client.query(
          `INSERT INTO researcher_profiles (user_id)
           VALUES ($1)`,
          [user.id]
        );
        
        await client.query('COMMIT');
        
        // Generate JWT token
        const token = this.generateToken(user);
        
        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            title: user.title,
            affiliation: user.affiliation,
            role: user.role
          },
          token
        };
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }
  
  static async login(email, password) {
    try {
      const result = await db.query(
        `SELECT u.id, u.name, u.email, u.password_hash, u.title, u.affiliation, u.role,
                rp.h_index, rp.publication_count
         FROM users u
         LEFT JOIN researcher_profiles rp ON u.id = rp.user_id
         WHERE u.email = $1`,
        [email]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
      }
      
      const user = result.rows[0];
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }
      
      // Generate JWT token
      const token = this.generateToken(user);
      
      // Store session
      await this.createSession(user.id, token);
      
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          title: user.title,
          affiliation: user.affiliation,
          role: user.role,
          h_index: user.h_index || 0,
          publication_count: user.publication_count || 0
        },
        token
      };
      
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }
  
  static generateToken(user) {
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        title: user.title,
        affiliation: user.affiliation,
        role: user.role
      }
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }
  
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
  
  static async createSession(userId, token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await db.query(
      `INSERT INTO user_sessions (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  }
  
  static async logout(userId) {
    await db.query(
      'DELETE FROM user_sessions WHERE user_id = $1',
      [userId]
    );
  }
}

module.exports = AuthService;
