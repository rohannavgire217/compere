const axios = require('axios');
const cheerio = require('cheerio');
const { searchAmazon } = require('../services/amazonService');
const { searchFlipkart } = require('../services/flipkartService');
const { searchSnapdeal } = require('../services/snapdealService');

const searchCache = new Map();

/**
 * PRODUCTION-READY PRODUCT COMPARISON ENGINE CONTROLLER
 */

// POST /api/engine/extract
const extractProduct = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'URL is required' });

    let platform = 'Unknown';
    if (url.includes('amazon')) platform = 'Amazon';
    else if (url.includes('flipkart')) platform = 'Flipkart';
    else if (url.includes('snapdeal')) platform = 'Snapdeal';

    console.log(`🔍 Extraction Request: ${platform} -> ${url}`);

    let productName = 'Unknown';
    try {
      // PRODUCTION HEADERS to avoid bot detection
      const { data: html } = await axios.get(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 8000
      });
      
      const $ = cheerio.load(html);
      
      // 1. Try JSON-LD (Most accurate)
      $('script[type="application/ld+json"]').each((i, el) => {
        try {
          const json = JSON.parse($(el).html());
          if (json.name) productName = json.name;
          if (Array.isArray(json)) {
             const prod = json.find(i => i['@type'] === 'Product');
             if (prod) productName = prod.name;
          }
        } catch (e) {}
      });

      // 2. Try OG Tags
      if (productName === 'Unknown') {
        productName = $('meta[property="og:title"]').attr('content') || 
                      $('meta[name="twitter:title"]').attr('content');
      }

      // 3. Try Heading tags
      if (productName === 'Unknown') {
        productName = $('#productTitle').text() || // Amazon
                      $('.B_NuCI').text() ||      // Flipkart
                      $('h1').first().text();
      }

      // NORMALIZE: Remove noise words
      productName = productName
        .replace(/(Buy|Online|@|Price|Flipkart|Amazon|Snapdeal|Best|Official|Store|India|Latest|New|PricePulse).*/gi, '')
        .replace(/\(.*\)/g, '') // Remove parentheses
        .trim();

      console.log(`✅ Extracted: "${productName}"`);

    } catch (scrapErr) {
      console.warn('Scraping failed, fallback to URL parsing');
      productName = url.split('/').pop().replace(/[_-]/g, ' ').split('?')[0];
    }

    res.json({ product_name: productName, platform });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/engine/compare?query=...
const findMatches = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Query is required' });

    if (searchCache.has(query)) return res.json(searchCache.get(query));

    // Parallel search across platforms
    const [amazon, flipkart, snapdeal] = await Promise.all([
      searchAmazon(query),
      searchFlipkart(query),
      searchSnapdeal(query)
    ]);

    const result = {
      product_name: query,
      platforms: [amazon, flipkart, snapdeal].filter(p => !!p)
    };

    searchCache.set(query, result);
    setTimeout(() => searchCache.delete(query), 10 * 60 * 1000); // 10 mins cache

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/engine/image-search
const imageSearch = async (req, res) => {
  try {
    const { fileName } = req.body;
    const keywords = fileName.split('.')[0].replace(/[-_]/g, ' ');
    res.json({ product_name: keywords });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  extractProduct,
  findMatches,
  imageSearch
};
