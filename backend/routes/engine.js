const express = require('express');
const router = express.Router();
const { extractProduct, imageSearch, findMatches } = require('../controllers/engineController');

/**
 * UPDATED ENGINE ROUTES FOR DYNAMIC PLATFORM MATCHING
 */

router.post('/extract', extractProduct);
router.post('/image-search', imageSearch);
router.get('/compare', findMatches);

module.exports = router;
