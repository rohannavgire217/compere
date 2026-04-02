const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['earned_click', 'earned_purchase', 'redeemed_cashback', 'redeemed_coupon'],
    required: true
  },
  points: { type: Number, required: true },
  description: { type: String },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  platform: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'redeemed'], default: 'confirmed' }
}, { timestamps: true });

module.exports = mongoose.model('Reward', rewardSchema);
