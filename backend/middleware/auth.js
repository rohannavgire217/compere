const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.offlineDemo) {
        req.user = {
          _id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role || 'admin',
          offlineDemo: true
        };
        return next();
      }

      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Database is offline' });
      }

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
};

const requireApiKey = (req, res, next) => {
  const expectedApiKey = (process.env.API_KEY || process.env.APP_API_KEY || '').trim();

  if (!expectedApiKey) {
    return next();
  }

  const providedApiKey = (req.headers['x-api-key'] || req.query.api_key || '').trim();
  if (!providedApiKey || providedApiKey !== expectedApiKey) {
    return res.status(401).json({ message: 'Invalid or missing API key' });
  }

  next();
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};

module.exports = { protect, requireApiKey, adminOnly };