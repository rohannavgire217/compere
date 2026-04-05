const Product = require('../models/Product');
const User = require('../models/User');
const Reward = require('../models/Reward');
const mongoose = require('mongoose');

const isDbConnected = () => mongoose.connection.readyState === 1;

// GET /api/products/search?q=earbuds&category=&minPrice=&maxPrice=&sort=
const searchProducts = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sort, brand } = req.query;
    let query = {};

    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }
    if (q) query.$text = { $search: q };
    if (category) query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (minPrice || maxPrice) {
      query.lowestPrice = {};
      if (minPrice) query.lowestPrice.$gte = Number(minPrice);
      if (maxPrice) query.lowestPrice.$lte = Number(maxPrice);
    }

    let sortOption = {};
    if (sort === 'price_asc') sortOption = { lowestPrice: 1 };
    else if (sort === 'price_desc') sortOption = { lowestPrice: -1 };
    else if (sort === 'popular') sortOption = { viewCount: -1 };
    else sortOption = { createdAt: -1 };

    const products = await Product.find(query).sort(sortOption).limit(50);

    // Track search history if logged in (fire-and-forget)
    if (req.user && q) {
      User.findByIdAndUpdate(req.user._id, {
        $push: { searchHistory: { $each: [{ query: q }], $slice: -20 } }
      }).exec();
    }

    const amazon = `https://www.amazon.in/s?k=${q}`;
    const flipkart = `https://www.flipkart.com/search?q=${q}`;
    const snapdeal = `https://www.snapdeal.com/search?keyword=${q}`;

    res.json({
      products, // your DB products
      external: {
        amazon,
        flipkart,
        snapdeal
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/products/:id/click — track affiliate click + award points
const trackClick = async (req, res) => {
  try {
    const { platform } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.clickCount += 1;
    await product.save();

    // Award 5 points per affiliate click if logged in
    if (req.user) {
      const POINTS = 5;
      await User.findByIdAndUpdate(req.user._id, { $inc: { rewardPoints: POINTS } });
      await Reward.create({
        user: req.user._id, type: 'earned_click', points: POINTS,
        description: `Clicked ${platform} link for "${product.name}"`,
        product: product._id, platform
      });
      // Add notification
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          notifications: {
            message: `You earned ${POINTS} points for clicking an affiliate link!`,
            type: 'reward'
          }
        }
      });
    }

    // Return the affiliate URL
    const affiliateLink = product.prices.find(p => p.platform === platform);
    res.json({ url: affiliateLink?.url || '#', pointsEarned: req.user ? 5 : 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/featured
const getFeatured = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json([]);
    }

    const products = await Product.find({}).sort({ viewCount: -1 }).limit(8);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/recognize?url=...
const recognizeLink = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: 'URL is required' });

    // Search for a product that contains this URL in its prices array
    const product = await Product.findOne({
      "prices.url": { $regex: url, $options: 'i' }
    });

    if (!product) {
      // Fallback: try to extract keywords from URL for a text search
      const keywords = url.replace(/https?:\/\/(www\.)?/, '').split(/[/?=&.]/).filter(s => s.length > 3).join(' ');
      const fallbackProducts = await Product.find({ $text: { $search: keywords } }).limit(5);
      return res.json({ product: null, suggestions: fallbackProducts });
    }

    res.json({ product, suggestions: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { searchProducts, getProduct, getCategories, trackClick, getFeatured, recognizeLink };

