const User = require('../models/User');
const Reward = require('../models/Reward');

// GET /api/rewards
const getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(50).populate('product', 'name');
    const user = await User.findById(req.user._id).select('rewardPoints wallet');
    res.json({ rewards, rewardPoints: user.rewardPoints, wallet: user.wallet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/rewards/redeem
const redeemPoints = async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.user._id);

    if (!points || points < 100)
      return res.status(400).json({ message: 'Minimum 100 points required to redeem' });
    if (user.rewardPoints < points)
      return res.status(400).json({ message: 'Insufficient points' });

    const cashback = points * 0.1; // 10 points = ₹1
    user.rewardPoints -= points;
    user.wallet += cashback;
    await user.save();

    await Reward.create({
      user: user._id, type: 'redeemed_cashback',
      points: -points,
      description: `Redeemed ${points} points for ₹${cashback.toFixed(2)} cashback`
    });

    await User.findByIdAndUpdate(user._id, {
      $push: {
        notifications: {
          message: `₹${cashback.toFixed(2)} added to your wallet!`,
          type: 'reward'
        }
      }
    });

    res.json({ message: `Redeemed! ₹${cashback.toFixed(2)} added to wallet`, wallet: user.wallet, rewardPoints: user.rewardPoints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getRewards, redeemPoints };
