const Product = require('../models/Product');
const fuse = require('fuse.js');

/**
 * PRODUCTION AMAZON MATCHING SERVICE
 * Goal: Exact Product Detail Page (PDP) URLs only
 */
const searchAmazon = async (query) => {
  // 1. Check Verified Database first for exact match (Highest Confidence)
  const products = await Product.find({});
  const options = {
    keys: ['name', 'brand', 'tags'],
    threshold: 0.3 // Strict matching
  };
  const fuseSearch = new fuse(products, options);
  const matched = fuseSearch.search(query);

  if (matched.length > 0) {
    const bestMatch = matched[0].item;
    const amazonPrice = bestMatch.prices.find(p => p.platform === 'Amazon');
    
    if (amazonPrice) {
      console.log(`✅ VERIFIED MATCH (Amazon): ${bestMatch.name}`);
      return {
        name: 'Amazon',
        product_name: bestMatch.name,
        price: amazonPrice.price,
        url: amazonPrice.url, // EXACT PDP URL from seed
        rating: amazonPrice.rating,
        status: 'verified'
      };
    }
  }

  // 2. Fallback to API/Scrape logic with STRICT link validation
  // In production, this would hit the Amazon PA-API
  // For this implementation, we ensure no search URLs are returned
  return null; // Don't return low-confidence search results 
};

module.exports = { searchAmazon };
