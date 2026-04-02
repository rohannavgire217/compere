const User = require('../models/User');
const Product = require('../models/Product');
const Reward = require('../models/Reward');

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [users, products, rewards] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Reward.countDocuments()
    ]);
    const totalClicks = await Product.aggregate([{ $group: { _id: null, total: { $sum: '$clickCount' } } }]);
    res.json({
      users, products, rewards,
      totalClicks: totalClicks[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/products
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/products/:id
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats, getUsers, createProduct, updateProduct, deleteProduct };
