const express = require('express');
const router = express.Router();
const { searchProducts, getProduct, getCategories, trackClick, getFeatured } = require('../controllers/productController');
const { protect } = require('../middleware/auth');

// Optional auth middleware (doesn't block, just enriches req.user if token provided)
const optionalAuth = async (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (_) {}
  }
  next();
};

router.get('/featured', getFeatured);
router.get('/categories', getCategories);
router.get('/search', optionalAuth, searchProducts);
router.get('/:id', getProduct);
router.post('/:id/click', optionalAuth, trackClick);

module.exports = router;
