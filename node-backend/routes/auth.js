const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Session = require('../models/Session');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (user_id, rememberMe = false) => {
  const expiresIn = rememberMe ? '30d' : process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn });
};

// Create session
const createSession = async (user_id, token, rememberMe = false) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7));
  
  const session = new Session({
    user_id,
    session_token: token,
    expires_at: expiresAt,
    remember_me: rememberMe
  });
  
  await session.save();
  return session;
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = new User({ name, email, password });
    await user.save();

    // Generate token and create session
    const token = generateToken(user.user_id);
    await createSession(user.user_id, token);

    // Set cookie
    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.status(201).json({
      message: 'Registration successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, rememberMe } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token and create session
    const token = generateToken(user.user_id, rememberMe);
    await createSession(user.user_id, token, rememberMe);

    // Set cookie
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge,
      path: '/'
    });

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json(req.user.toJSON());
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    // Delete session
    await Session.deleteOne({ session_token: req.session.session_token });

    // Clear cookie
    res.clearCookie('session_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/'
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset token (mocked - no email sent)
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return res.json({ 
        message: 'If an account exists with this email, you will receive a password reset link',
        // For demo purposes, include token (remove in production)
        demo_note: 'Email integration not configured. In production, a reset link would be sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save to user
    user.reset_token = hashedToken;
    user.reset_token_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    // In production, send email here with Zoho
    // For now, return token for testing
    res.json({
      message: 'If an account exists with this email, you will receive a password reset link',
      // Demo mode - remove in production
      demo_reset_token: resetToken,
      demo_note: 'Email integration not configured. Use this token to reset password.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Hash the token to compare
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      reset_token: hashedToken,
      reset_token_expires: { $gt: new Date() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    // Invalidate all existing sessions
    await Session.deleteMany({ user_id: user.user_id });

    res.json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/google/session
// @desc    Handle Google OAuth session from Emergent Auth
// @access  Public
router.post('/google/session', async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // Call Emergent Auth to get session data
    const response = await fetch('https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data', {
      method: 'GET',
      headers: {
        'X-Session-ID': session_id
      }
    });

    if (!response.ok) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    const sessionData = await response.json();
    const { email, name, picture, session_token: emergent_token } = sessionData;

    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user with Google auth
      user = new User({
        name,
        email,
        picture,
        password: crypto.randomBytes(32).toString('hex'), // Random password for OAuth users
        auth_provider: 'google'
      });
      await user.save();
    } else {
      // Update existing user info
      user.name = name;
      user.picture = picture;
      if (user.auth_provider === 'local') {
        user.auth_provider = 'google';
      }
      await user.save();
    }

    // Generate our own token
    const token = generateToken(user.user_id, true);
    await createSession(user.user_id, token, true);

    // Set cookie
    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.json({
      message: 'Google login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Google session error:', error);
    res.status(500).json({ message: 'Server error during Google authentication' });
  }
});

module.exports = router;
