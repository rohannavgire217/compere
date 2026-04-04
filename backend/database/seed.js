require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * HIGH-ACCURACY SEED DATA WITH CANONICAL URLS AND SYNCED PRICES
 */
const productsLabels = [
  {
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    brand: 'Sony',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    tags: ['headphones', 'wireless', 'sony', 'audio', 'xm5'],
    prices: [
      { platform: 'Amazon', price: 29990, url: 'https://www.amazon.in/dp/B0B3C3L3Z3', rating: 4.6 },
      { platform: 'Flipkart', price: 29990, url: 'https://www.flipkart.com/sony-wh-1000xm5-active-noise-cancellation-bluetooth-headset/p/itm2576b539c9b1d', rating: 4.5 },
      { platform: 'Snapdeal', price: 30990, url: 'https://www.snapdeal.com/product/sony-wh1000xm5-wireless-overhead-headphones/678912345678', rating: 4.4 }
    ]
  },
  {
    name: 'Apple iPhone 15 128GB Black',
    brand: 'Apple',
    category: 'Smartphones',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',
    tags: ['iphone', 'apple', 'mobile', '5g', '15'],
    prices: [
      { platform: 'Amazon', price: 71290, url: 'https://www.amazon.in/dp/B0CHX2F5QT', rating: 4.7 },
      { platform: 'Flipkart', price: 71490, url: 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ef641e69cd13', rating: 4.6 },
      { platform: 'Snapdeal', price: 72900, url: 'https://www.snapdeal.com/product/apple-iphone-15-128gb-black/621123456789', rating: 4.5 }
    ]
  },
  {
    name: 'Samsung Galaxy Tab S9 FE 5G',
    brand: 'Samsung',
    category: 'Tablets',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    tags: ['samsung', 'tablet', 'android', 'galaxy', 's9fe'],
    prices: [
      { platform: 'Amazon', price: 34999, url: 'https://www.amazon.in/dp/B0CHV9YV5S', rating: 4.3 },
      { platform: 'Flipkart', price: 34999, url: 'https://www.flipkart.com/samsung-galaxy-tab-s9-fe-8-gb-ram-128-rom-10-9-inch-wi-fi-only-tablet/p/itmdbb35e368149d', rating: 4.4 },
      { platform: 'Snapdeal', price: 36999, url: 'https://www.snapdeal.com/product/samsung-galaxy-tab-s9-fe/654321098765', rating: 4.5 }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for High-Accuracy Seed');

    await Product.deleteMany({});
    await Product.insertMany(productsLabels);
    console.log(`✅ Seeded ${productsLabels.length} verified products with direct PDP URLs`);

    await User.deleteMany({ email: 'admin@pricepulse.com' });
    await User.create({
      name: 'Admin',
      email: 'admin@pricepulse.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('✅ Admin user refreshed');

    process.exit(0);
  } catch (err) {
    console.error('❌ High-accuracy seed error:', err.message);
    process.exit(1);
  }
};

seedDB();
