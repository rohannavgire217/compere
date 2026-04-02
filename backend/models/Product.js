const mongoose = require('mongoose');

const priceEntrySchema = new mongoose.Schema({
  platform: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: Number, default: 0 },
  url: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  deliveryDays: { type: Number, default: 3 },
  inStock: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  tags: [String],
  prices: [priceEntrySchema],
  lowestPrice: { type: Number },
  highestPrice: { type: Number },
  lowestPriceEver: { type: Number },
  lowestPriceEverDate: { type: Date },
  priceHistory: [{
    price: Number,
    platform: String,
    date: { type: Date, default: Date.now }
  }],
  affiliateLinks: [{
    platform: String,
    url: String,
    commission: { type: Number, default: 2 }
  }],
  clickCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

// Auto-compute lowest/highest price before save
productSchema.pre('save', function (next) {
  if (this.prices && this.prices.length > 0) {
    const allPrices = this.prices.map(p => p.price);
    this.lowestPrice = Math.min(...allPrices);
    this.highestPrice = Math.max(...allPrices);
    if (!this.lowestPriceEver || this.lowestPrice < this.lowestPriceEver) {
      this.lowestPriceEver = this.lowestPrice;
      this.lowestPriceEverDate = new Date();
    }
  }
  next();
});

productSchema.index({ name: 'text', brand: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
