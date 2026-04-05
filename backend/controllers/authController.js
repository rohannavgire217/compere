const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

const isDbConnected = () => mongoose.connection.readyState === 1;
const DEMO_ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL || 'admin@pricepulse.com';
const DEMO_ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || 'admin123';

// POST /api/auth/register
const register = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        message: 'Database is offline. Registration is unavailable right now.'
      });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please fill all fields' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, rewardPoints: user.rewardPoints,
      token: generateToken({
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role
      })
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isDbConnected()) {
      if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
        const demoUser = {
          _id: 'offline-admin',
          name: 'Demo Admin',
          email: DEMO_ADMIN_EMAIL,
          role: 'admin',
          rewardPoints: 0,
          wallet: 0,
          offlineDemo: true
        };

        return res.json({
          ...demoUser,
          token: generateToken({
            id: demoUser._id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            offlineDemo: true
          })
        });
      }

      return res.status(503).json({
        message: 'Database is offline. Use demo admin credentials or reconnect MongoDB.'
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, rewardPoints: user.rewardPoints, wallet: user.wallet,
      token: generateToken({
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role
      })
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    if (req.user?.offlineDemo) {
      return res.json(req.user);
    }

    if (!isDbConnected()) {
      return res.status(503).json({ message: 'Database is offline' });
    }

    const user = await User.findById(req.user._id).select('-password').populate('wishlist', 'name imageUrl lowestPrice');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/notifications
const getNotifications = async (req, res) => {
  try {
    if (req.user?.offlineDemo) {
      return res.json([]);
    }

    if (!isDbConnected()) {
      return res.status(503).json({ message: 'Database is offline' });
    }

    const user = await User.findById(req.user._id).select('notifications');
    res.json(user.notifications.sort((a, b) => b.createdAt - a.createdAt));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/notifications/read
const markNotificationsRead = async (req, res) => {
  try {
    if (req.user?.offlineDemo) {
      return res.json({ message: 'No notifications in offline demo mode' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({ message: 'Database is offline' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $set: { 'notifications.$[].read': true }
    });
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, getNotifications, markNotificationsRead };