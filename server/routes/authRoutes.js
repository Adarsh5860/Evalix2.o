const express = require('express');

const router = express.Router();

// Demo credentials for local development only.
// Do NOT put real passwords here.
const DEMO_EMAIL = process.env.AUTH_EMAIL || 'demo@evalix.com';
const DEMO_PASSWORD = process.env.AUTH_PASSWORD || 'EvalixDemo123';

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check that both fields were provided
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required.'
        });
    }

    // Validate credentials
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        return res.status(200).json({
            success: true,
            message: 'Login successful.'
        });
    }

    // Invalid credentials
    return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
    });
});

module.exports = router;