require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

const products = [
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    brand: 'Sony',
    category: 'Electronics',
    description: 'Industry-leading noise canceling headphones with Auto NC Optimizer',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    tags: ['headphones', 'wireless', 'noise-canceling', 'sony', 'audio'],
    prices: [
      { platform: 'Amazon', price: 24990, originalPrice: 29990, discount: 17, url: 'https://amazon.in', rating: 4.6, reviewCount: 8420, deliveryDays: 2, inStock: true },
      { platform: 'Flipkart', price: 25499, originalPrice: 29990, discount: 15, url: 'https://flipkart.com', rating: 4.5, reviewCount: 6230, deliveryDays: 3, inStock: true },
      { platform: 'Croma', price: 26990, originalPrice: 29990, discount: 10, url: 'https://croma.com', rating: 4.4, reviewCount: 1200, deliveryDays: 4, inStock: true }
    ],
    priceHistory: [
      { price: 29990, platform: 'Amazon', date: new Date('2024-01-01') },
      { price: 27990, platform: 'Amazon', date: new Date('2024-03-01') },
      { price: 25990, platform: 'Amazon', date: new Date('2024-06-01') },
      { price: 24990, platform: 'Amazon', date: new Date('2024-09-01') }
    ]
  },
  {
    name: 'Apple iPhone 15 128GB',
    brand: 'Apple',
    category: 'Smartphones',
    description: 'iPhone 15 with Dynamic Island, 48MP camera, and USB-C',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',
    tags: ['iphone', 'apple', 'smartphone', 'mobile', '5g'],
    prices: [
      { platform: 'Amazon', price: 69900, originalPrice: 79900, discount: 13, url: 'https://amazon.in', rating: 4.7, reviewCount: 15200, deliveryDays: 1, inStock: true },
      { platform: 'Flipkart', price: 70900, originalPrice: 79900, discount: 11, url: 'https://flipkart.com', rating: 4.6, reviewCount: 12300, deliveryDays: 2, inStock: true },
      { platform: 'Reliance Digital', price: 72900, originalPrice: 79900, discount: 9, url: 'https://reliancedigital.in', rating: 4.5, reviewCount: 3400, deliveryDays: 3, inStock: false }
    ],
    priceHistory: [
      { price: 79900, platform: 'Amazon', date: new Date('2023-10-01') },
      { price: 75900, platform: 'Amazon', date: new Date('2024-01-01') },
      { price: 72900, platform: 'Amazon', date: new Date('2024-04-01') },
      { price: 69900, platform: 'Amazon', date: new Date('2024-08-01') }
    ]
  },
  {
    name: 'Samsung Galaxy Tab S9 FE',
    brand: 'Samsung',
    category: 'Tablets',
    description: '10.9-inch tablet with S Pen included, 8GB RAM',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    tags: ['samsung', 'tablet', 'android', 's-pen', 'galaxy'],
    prices: [
      { platform: 'Amazon', price: 37999, originalPrice: 44999, discount: 16, url: 'https://amazon.in', rating: 4.3, reviewCount: 4200, deliveryDays: 2, inStock: true },
      { platform: 'Flipkart', price: 36999, originalPrice: 44999, discount: 18, url: 'https://flipkart.com', rating: 4.4, reviewCount: 3800, deliveryDays: 2, inStock: true },
      { platform: 'Samsung Store', price: 44999, originalPrice: 44999, discount: 0, url: 'https://samsung.com', rating: 4.5, reviewCount: 900, deliveryDays: 5, inStock: true }
    ],
    priceHistory: [
      { price: 44999, platform: 'Amazon', date: new Date('2024-01-01') },
      { price: 41999, platform: 'Amazon', date: new Date('2024-04-01') },
      { price: 38999, platform: 'Amazon', date: new Date('2024-07-01') },
      { price: 37999, platform: 'Amazon', date: new Date('2024-10-01') }
    ]
  },
  {
    name: 'boAt Rockerz 450 Bluetooth Headphones',
    brand: 'boAt',
    category: 'Electronics',
    description: 'On-ear wireless headphones with 15hr battery life',
    imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
    tags: ['boat', 'headphones', 'bluetooth', 'budget', 'wireless'],
    prices: [
      { platform: 'Amazon', price: 999, originalPrice: 2990, discount: 67, url: 'https://amazon.in', rating: 4.0, reviewCount: 52000, deliveryDays: 2, inStock: true },
      { platform: 'Flipkart', price: 1099, originalPrice: 2990, discount: 63, url: 'https://flipkart.com', rating: 3.9, reviewCount: 43000, deliveryDays: 3, inStock: true }
    ],
    priceHistory: [
      { price: 2990, platform: 'Amazon', date: new Date('2024-01-01') },
      { price: 1499, platform: 'Amazon', date: new Date('2024-04-01') },
      { price: 1199, platform: 'Amazon', date: new Date('2024-07-01') },
      { price: 999, platform: 'Amazon', date: new Date('2024-10-01') }
    ]
  },
  {
    name: 'Logitech MX Master 3S Mouse',
    brand: 'Logitech',
    category: 'Computer Accessories',
    description: 'Advanced wireless mouse with 8K DPI sensor and MagSpeed scroll',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    tags: ['logitech', 'mouse', 'wireless', 'productivity', 'ergonomic'],
    prices: [
      { platform: 'Amazon', price: 8495, originalPrice: 9995, discount: 15, url: 'https://amazon.in', rating: 4.7, reviewCount: 7800, deliveryDays: 1, inStock: true },
      { platform: 'Flipkart', price: 8995, originalPrice: 9995, discount: 10, url: 'https://flipkart.com', rating: 4.6, reviewCount: 5200, deliveryDays: 2, inStock: true }
    ],
    priceHistory: [
      { price: 9995, platform: 'Amazon', date: new Date('2024-01-01') },
      { price: 9495, platform: 'Amazon', date: new Date('2024-05-01') },
      { price: 8495, platform: 'Amazon', date: new Date('2024-09-01') }
    ]
  },
  {
    name: 'Xiaomi Redmi Note 13 Pro 5G',
    brand: 'Xiaomi',
    category: 'Smartphones',
    description: '200MP camera, 5100mAh battery, 67W fast charging',
    imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
    tags: ['xiaomi', 'redmi', 'smartphone', '5g', 'budget'],
    prices: [
      { platform: 'Amazon', price: 23999, originalPrice: 27999, discount: 14, url: 'https://amazon.in', rating: 4.3, reviewCount: 22000, deliveryDays: 2, inStock: true },
      { platform: 'Flipkart', price: 22999, originalPrice: 27999, discount: 18, url: 'https://flipkart.com', rating: 4.3, reviewCount: 18000, deliveryDays: 2, inStock: true },
      { platform: 'Mi Store', price: 27999, originalPrice: 27999, discount: 0, url: 'https://mi.com', rating: 4.4, reviewCount: 4000, deliveryDays: 4, inStock: true }
    ],
    priceHistory: [
      { price: 27999, platform: 'Amazon', date: new Date('2024-01-01') },
      { price: 25999, platform: 'Amazon', date: new Date('2024-05-01') },
      { price: 23999, platform: 'Amazon', date: new Date('2024-09-01') }
    ]
  },
  {
    name: 'LG 32" 4K UHD Monitor',
    brand: 'LG',
    category: 'Monitors',
    description: '32UN550-W with HDR10, AMD FreeSync, USB-C',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a573d5d34c?w=400',
    tags: ['monitor', 'lg', '4k', 'uhd', 'display'],
    prices: [
      { platform: 'Amazon', price: 28990, originalPrice: 35000, discount: 17, url: 'https://amazon.in', rating: 4.5, reviewCount: 3400, deliveryDays: 3, inStock: true },
      { platform: 'Flipkart', price: 29490, originalPrice: 35000, discount: 16, url: 'https://flipkart.com', rating: 4.4, reviewCount: 2800, deliveryDays: 4, inStock: true },
      { platform: 'Croma', price: 31990, originalPrice: 35000, discount: 9, url: 'https://croma.com', rating: 4.3, reviewCount: 800, deliveryDays: 5, inStock: false }
    ],
    priceHistory: [
      { price: 35000, platform: 'Amazon', date: new Date('2024-01-01') },
      { price: 32000, platform: 'Amazon', date: new Date('2024-05-01') },
      { price: 28990, platform: 'Amazon', date: new Date('2024-09-01') }
    ]
  },
  {
    name: 'Instant Pot Duo 7-in-1 Pressure Cooker',
    brand: 'Instant Pot',
    category: 'Kitchen',
    description: '6Qt multi-use pressure cooker, slow cooker, rice cooker',
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400',
    tags: ['instant pot', 'pressure cooker', 'kitchen', 'cooking', 'appliance'],
    prices: [
      { platform: 'Amazon', price: 7499, originalPrice: 10999, discount: 32, url: 'https://amazon.in', rating: 4.6, reviewCount: 31000, deliveryDays: 2, inStock: true },
      { platform: 'Flipkart', price: 7999, originalPrice: 10999, discount: 27, url: 'https://flipkart.com', rating: 4.5, reviewCount: 24000, deliveryDays: 3, inStock: true }
    ],
    priceHistory: [
      { price: 10999, platform: 'Amazon', date: new Date('2024-01-01') },
      { price: 8999, platform: 'Amazon', date: new Date('2024-05-01') },
      { price: 7499, platform: 'Amazon', date: new Date('2024-08-01') }
    ]
  },
  {
    name: 'Nike Air Max 270',
    brand: 'Nike',
    category: 'Footwear',
    description: 'Lifestyle running shoes with Max Air unit in the heel',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    tags: ['nike', 'shoes', 'sneakers', 'running', 'sports'],
    prices: [
      { platform: 'Amazon', price: 8995, originalPrice: 12995, discount: 31, url: 'https://amazon.in', rating: 4.4, reviewCount: 9800, deliveryDays: 3, inStock: true },
      { platform: 'Flipkart', price: 9495, originalPrice: 12995, discount: 27, url: 'https://flipkart.com', rating: 4.3, reviewCount: 7200, deliveryDays: 3, inStock: true },
      { platform: 'Nike Store', price: 12995, originalPrice: 12995, discount: 0, url: 'https://nike.com', rating: 4.6, reviewCount: 2100, deliveryDays: 5, inStock: true }
    ],
    priceHistory: [
      { price: 12995, platform: 'Amazon', date: new Date('2024-01-01') },
      { price: 10995, platform: 'Amazon', date: new Date('2024-05-01') },
      { price: 8995, platform: 'Amazon', date: new Date('2024-09-01') }
    ]
  },
  {
    name: 'Fire-Boltt Phoenix Pro Smartwatch',
    brand: 'Fire-Boltt',
    category: 'Wearables',
    description: '1.39" AMOLED display, Bluetooth calling, SpO2 monitor',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    tags: ['smartwatch', 'fire-boltt', 'wearable', 'fitness', 'budget'],
    prices: [
      { platform: 'Amazon', price: 1499, originalPrice: 6999, discount: 79, url: 'https://amazon.in', rating: 3.9, reviewCount: 48000, deliveryDays: 2, inStock: true },
      { platform: 'Flipkart', price: 1299, originalPrice: 6999, discount: 81, url: 'https://flipkart.com', rating: 3.8, reviewCount: 39000, deliveryDays: 2, inStock: true }
    ],
    priceHistory: [
      { price: 6999, platform: 'Amazon', date: new Date('2024-01-01') },
      { price: 2999, platform: 'Amazon', date: new Date('2024-04-01') },
      { price: 1799, platform: 'Amazon', date: new Date('2024-07-01') },
      { price: 1499, platform: 'Amazon', date: new Date('2024-10-01') }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    const inserted = await Product.insertMany(products);
    console.log(`✅ Seeded ${inserted.length} products`);

    // Create admin user
    await User.deleteMany({ email: 'admin@pricepulse.com' });
    await User.create({
      name: 'Admin',
      email: 'admin@pricepulse.com',
      password: 'admin123',
      role: 'admin',
      rewardPoints: 0
    });
    console.log('✅ Admin user created: admin@pricepulse.com / admin123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seedDB();
