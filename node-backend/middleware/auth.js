const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies first, then Authorization header
    if (req.cookies.session_token) {
      token = req.cookies.session_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if session exists and is valid
    const session = await Session.findOne({ 
      session_token: token,
      user_id: decoded.user_id 
    });

    if (!session) {
      return res.status(401).json({ message: 'Session not found' });
    }

    if (new Date(session.expires_at) < new Date()) {
      await Session.deleteOne({ session_token: token });
      return res.status(401).json({ message: 'Session expired' });
    }

    // Get user
    const user = await User.findOne({ user_id: decoded.user_id });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
