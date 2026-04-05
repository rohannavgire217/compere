const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const isDbConnected = () => mongoose.connection.readyState === 1;

// GET /api/wishlist
const getWishlist = async (req, res) => {
  try {
    if (req.user?.offlineDemo) {
      return res.json([]);
    }

    if (!isDbConnected()) {
      return res.json([]);
    }

    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) return res.json([]);
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/wishlist/:productId
const addToWishlist = async (req, res) => {
  try {
    if (req.user?.offlineDemo) {
      return res.status(400).json({ message: 'Wishlist changes are disabled in offline demo mode' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({ message: 'Database is offline' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.wishlist.includes(req.params.productId))
      return res.status(400).json({ message: 'Already in wishlist' });

    user.wishlist.push(req.params.productId);
    await user.save();
    res.json({ message: 'Added to wishlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/wishlist/:productId
const removeFromWishlist = async (req, res) => {
  try {
    if (req.user?.offlineDemo) {
      return res.status(400).json({ message: 'Wishlist changes are disabled in offline demo mode' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({ message: 'Database is offline' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { wishlist: req.params.productId }
    });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
