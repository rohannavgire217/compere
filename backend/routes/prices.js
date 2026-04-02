const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/prices/:productId/history
router.get('/:productId/history', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select('priceHistory name lowestPriceEver lowestPriceEverDate');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({
      name: product.name,
      lowestPriceEver: product.lowestPriceEver,
      lowestPriceEverDate: product.lowestPriceEverDate,
      history: product.priceHistory
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
