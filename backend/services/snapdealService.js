const Product = require('../models/Product');
const Fuse = require('fuse.js');

/**
 * PRODUCTION SNAPDEAL MATCHING SERVICE
 * Goal: Exact Snapdeal Product URLs only
 */
const searchSnapdeal = async (query) => {
  const products = await Product.find({});
  const fuseSearch = new Fuse(products, { keys: ['name', 'brand'], threshold: 0.3 });
  const matched = fuseSearch.search(query);

  if (matched.length > 0) {
    const bestMatch = matched[0].item;
    const snapPrice = bestMatch.prices.find(p => p.platform === 'Snapdeal');
    
    if (snapPrice) {
      console.log(`✅ VERIFIED MATCH (Snapdeal): ${bestMatch.name}`);
      return {
        name: 'Snapdeal',
        product_name: bestMatch.name,
        price: snapPrice.price,
        url: snapPrice.url, // EXACT SNAPDEAL PDP LINK
        rating: snapPrice.rating,
        status: 'verified'
      };
    }
  }

  return null; // Reject low confidence search results
};

module.exports = { searchSnapdeal };
