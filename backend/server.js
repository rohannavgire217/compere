const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
mongoose.set('bufferCommands', false);
let isMongoConnected = false;

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isOriginAllowed = origin => {
  if (!origin) return true;

  return allowedOrigins.some(rule => {
    if (rule === '*') return true;
    if (rule === origin) return true;

    if (rule.includes('*')) {
      const pattern = `^${rule.split('*').map(escapeRegex).join('.*')}$`;
      return new RegExp(pattern).test(origin);
    }

    return false;
  });
};

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/prices', require('./routes/prices'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/engine', require('./routes/engine'));

// Health check
const healthHandler = (req, res) => {
  res.json({
    status: 'ok',
    message: 'PricePulse API running',
    db: isMongoConnected ? 'connected' : 'disconnected',
    uptimeSeconds: Math.floor(process.uptime())
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

const connectMongo = async () => {
  if (isMongoConnected) return;

  if (!process.env.MONGO_URI) {
    console.error('⚠️  MONGO_URI is not set. Database features will fail until this is configured.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isMongoConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('⚠️  Database Error (Resilient Mode Active):', err.message);
  }
};

connectMongo();

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  const HOST = process.env.HOST || '0.0.0.0';
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Resilient Engine running at http://${HOST}:${PORT}`);
    if (!process.env.JWT_SECRET) {
      console.error('⚠️  JWT_SECRET is missing. Auth routes may fail in production.');
    }
    console.log(`🌐 CORS allowed origins: ${allowedOrigins.join(', ')}`);
  });
}

module.exports = app;