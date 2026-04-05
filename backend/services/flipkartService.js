const Product = require('../models/Product');
const fuse = require('fuse.js');

/**
 * PRODUCTION FLIPKART MATCHING SERVICE
 * Goal: Exact Flipkart Product URLs only
 */
const searchFlipkart = async (query) => {
  const products = await Product.find({});
  const fuseSearch = new fuse(products, { keys: ['name', 'brand'], threshold: 0.3 });
  const matched = fuseSearch.search(query);

  if (matched.length > 0) {
    const bestMatch = matched[0].item;
    const flipkartData = bestMatch.prices.find(p => p.platform === 'Flipkart');
    
    if (flipkartData) {
      console.log(`✅ VERIFIED MATCH (Flipkart): ${bestMatch.name}`);
      return {
        name: 'Flipkart',
        product_name: bestMatch.name,
        price: flipkartData.price,
        url: flipkartData.url, // EXACT FLIPKART PDP LINK
        rating: flipkartData.rating,
        status: 'verified'
      };
    }
  }

  return null; // Reject low confidence search results
};

module.exports = { searchFlipkart };
