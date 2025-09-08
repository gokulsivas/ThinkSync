const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// 🎯 CRITICAL: Create Express Router
const router = express.Router();

// Database connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// JWT Configuration
const SECRET_KEY = process.env.JWT_SECRET || 'ThinkSync2025SecureJWTSecretKey';
const ACCESS_TOKEN_EXPIRE_MINUTES = 30;

function createAccessToken(data, expiresInMinutes = 30) {
    const exp = Math.floor(Date.now() / 1000) + (expiresInMinutes * 60);
    const payload = { ...data, exp };
    return jwt.sign(payload, SECRET_KEY, { algorithm: 'HS256' });
}

// Test route
router.get('/', (req, res) => {
    console.log('✅ Auth routes are working!');
    res.json({ 
        message: 'Auth routes are working!',
        timestamp: new Date().toISOString(),
        availableRoutes: ['/register', '/login']
    });
});

// 🎯 REGISTRATION ROUTE (your working code - DON'T CHANGE)
router.post('/register', async (req, res) => {
    console.log('🟡 [REGISTER] Registration endpoint hit!');
    console.log('🟡 [REGISTER] Request body:', JSON.stringify(req.body, null, 2));

    try {
        const { email, password, confirm_password, name, title, affiliation } = req.body;

        // Input validation
        if (!email || !password || !name) {
            console.log('❌ [REGISTER] Missing required fields');
            return res.status(400).json({ 
                message: 'Email, password, and name are required' 
            });
        }

        if (password !== confirm_password) {
            console.log('❌ [REGISTER] Password mismatch');
            return res.status(400).json({ 
                message: 'Passwords do not match' 
            });
        }

        console.log('✅ [REGISTER] Input validation passed');

        // Check if user exists
        console.log('🔍 [REGISTER] Checking if user exists...');
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rowCount > 0) {
            console.log('❌ [REGISTER] User already exists');
            return res.status(400).json({ 
                message: 'User with this email already exists' 
            });
        }

        console.log('✅ [REGISTER] Email available');

        // Hash password
        console.log('🔐 [REGISTER] Hashing password...');
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user
        console.log('💾 [REGISTER] Inserting user into database...');
        const insertQuery = `
            INSERT INTO users (email, password_hash, name, title, affiliation, role, email_verified) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING id, email, name, title, affiliation, role, created_at
        `;
        
        const result = await pool.query(insertQuery, [
            email.toLowerCase(),
            passwordHash,
            name,
            title || null,
            affiliation || null,
            'user',
            false
        ]);

        if (result.rowCount === 0) {
            throw new Error('Failed to insert user');
        }

        const newUser = result.rows[0];
        console.log('✅ [REGISTER] User created:', { id: newUser.id, email: newUser.email });

        // Generate JWT
        const accessToken = createAccessToken({ sub: newUser.email });

        console.log('✅ [REGISTER] Registration complete!');

        res.status(201).json({
            message: 'Registration successful!',
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                title: newUser.title,
                affiliation: newUser.affiliation,
                role: newUser.role
            },
            access_token: accessToken,
            token_type: 'bearer',
            expires_in: ACCESS_TOKEN_EXPIRE_MINUTES * 60
        });

    } catch (error) {
        console.error('❌ [REGISTER] Error:', error.message);
        console.error('Error code:', error.code);
        
        if (error.code === '23505') {
            return res.status(400).json({ 
                message: 'User with this email already exists' 
            });
        }

        res.status(500).json({ 
            message: 'Registration failed. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
        });
    }
});

// 🔐 LOGIN ROUTE (for later debugging)
router.post('/login', async (req, res) => {
    console.log('🔐 [LOGIN] Login attempt started');
    console.log('🔐 [LOGIN] Request body:', { email: req.body.email, hasPassword: !!req.body.password });

    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            console.log('❌ [LOGIN] Missing email or password');
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }

        console.log('🔍 [LOGIN] Looking up user with email:', email);

        // Find user by email
        const userQuery = await pool.query(
            'SELECT * FROM users WHERE email = $1', 
            [email.toLowerCase()]
        );

        if (userQuery.rowCount === 0) {
            console.log('❌ [LOGIN] User not found in database');
            return res.status(400).json({ 
                message: 'Invalid email or password. Please try again.' 
            });
        }

        const user = userQuery.rows[0];
        console.log('✅ [LOGIN] User found in database:', { id: user.id, email: user.email });

        // 🎯 CRITICAL: Compare plain password with stored hash using bcrypt
        console.log('🔐 [LOGIN] Comparing passwords...');
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        console.log('🔐 [LOGIN] Password comparison result:', passwordMatch);

        if (!passwordMatch) {
            console.log('❌ [LOGIN] Password verification failed');
            return res.status(400).json({ 
                message: 'Invalid email or password. Please try again.' 
            });
        }

        console.log('✅ [LOGIN] Password verified successfully');

        // Generate JWT token
        console.log('🎫 [LOGIN] Generating JWT access token...');
        const accessToken = createAccessToken({ sub: user.email });

        console.log('✅ [LOGIN] Login successful for user:', user.email);

        // Return success response
        res.json({
            message: 'Login successful!',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                title: user.title,
                affiliation: user.affiliation,
                role: user.role || 'user'
            },
            access_token: accessToken,
            token_type: 'bearer',
            expires_in: ACCESS_TOKEN_EXPIRE_MINUTES * 60
        });

    } catch (error) {
        console.error('❌ [LOGIN] Login error:', error.message);
        res.status(500).json({ 
            message: 'Login failed. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
        });
    }
});

// 🎯 CRITICAL: Export the router
module.exports = router;
