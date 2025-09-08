const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('🚀 Starting ThinkSync Backend Server...');

const app = express();
const PORT = process.env.PORT || 8000;

// ====== MIDDLEWARE SETUP ======
console.log('⚙️ Setting up middleware...');

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// ====== ROUTES SETUP ======
console.log('🛣️ Setting up routes...');

// Root test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'ThinkSync Backend API is running!',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            register: '/api/auth/register',
            login: '/api/auth/login'
        }
    });
});

// 🎯 CRITICAL: Mount auth routes
try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes mounted at /api/auth');
} catch (error) {
    console.error('❌ Error loading auth routes:', error.message);
    console.error('Make sure ./routes/auth.js exists and exports a router');
    process.exit(1);
}

// 404 handler
app.use('*', (req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: 'Route not found',
        method: req.method,
        url: req.originalUrl,
        availableRoutes: [
            'GET /',
            'GET /api/auth',
            'POST /api/auth/register',
            'POST /api/auth/login'
        ]
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('❌ Server Error:', error);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// ====== START SERVER ======
app.listen(PORT, () => {
    console.log('');
    console.log('🎉 ================================');
    console.log(`🚀 ThinkSync Server running on port ${PORT}`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`🔐 Auth Routes: http://localhost:${PORT}/api/auth`);
    console.log('🎉 ================================');
    console.log('');
});

module.exports = app;
