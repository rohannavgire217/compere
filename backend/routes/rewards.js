const express = require('express');
const router = express.Router();
const { getRewards, redeemPoints } = require('../controllers/rewardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRewards);
router.post('/redeem', protect, redeemPoints);

module.exports = router;
