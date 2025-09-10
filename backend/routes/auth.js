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

// 🎯 REGISTRATION ROUTE (updated with UUID support)
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
            'SELECT user_id FROM users WHERE email = $1',
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

        // Insert user - 1️⃣ UPDATED: Using user_id AS id in RETURNING clause
        console.log('💾 [REGISTER] Inserting user into database...');
        const insertQuery = `
            INSERT INTO users (email, password_hash, name, title, affiliation, role, email_verified) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING user_id AS id, email, name, title, affiliation, role, created_at
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
                id: newUser.id,          // <-- now UUID
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

// 🔐 LOGIN ROUTE - 2️⃣ UPDATED: Using user_id AS id in SELECT
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

        // Find user by email - UPDATED: Using user_id AS id in SELECT
        const userQuery = await pool.query(
            'SELECT user_id AS id, email, name, title, affiliation, role, password_hash FROM users WHERE email = $1', 
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
                id: user.id,             // <-- UUID
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

// ✅ Middleware to authenticate JWT tokens
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        console.log('❌ [AUTH] No token provided');
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
        if (err) {
            console.log('❌ [AUTH] Token verification failed:', err.message);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        
        console.log('✅ [AUTH] Token verified for user:', decoded.sub);
        req.user = decoded;
        next();
    });
}

// ✅ Profile endpoint - Add this BEFORE the module.exports line
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        console.log('🔍 [AUTH] Profile requested for user:', req.user.sub);
        
        // Get user data from database using email from JWT token
        const userQuery = await pool.query(
            'SELECT user_id AS id, email, name, title, affiliation, role, hindex, research_interests, awards, publications, social_links, is_public, profile_picture FROM users WHERE email = $1',
            [req.user.sub]
        );

        if (userQuery.rowCount === 0) {
            console.log('❌ [AUTH] User not found in database');
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userQuery.rows[0];
        console.log('✅ [AUTH] User data retrieved:', { id: user.id, email: user.email });

        // Return user profile data in the format your React app expects
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                title: user.title,
                affiliation: user.affiliation,
                role: user.role,
                hIndex: user.hindex || 0,
                researchInterests: user.research_interests || [],
                awards: user.awards || [],
                publications: user.publications || [],
                socialLinks: user.social_links || {
                    orcid: '',
                    googleScholar: '',
                    linkedIn: '',
                    github: ''
                },
                isPublic: user.is_public !== undefined ? user.is_public : true,
                profilePicture: user.profile_picture || ''
            }
        });
    } catch (error) {
        console.error('❌ [AUTH] Profile fetch error:', error);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

// 🎯 CRITICAL: Export the router
module.exports = router;