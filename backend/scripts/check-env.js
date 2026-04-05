const requiredInProduction = ['MONGO_URI', 'JWT_SECRET'];

const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

if (!isProd) {
  process.exit(0);
}

const missing = requiredInProduction.filter(key => !String(process.env[key] || '').trim());
if (missing.length > 0) {
  console.error(`[env-check] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const mongoUri = String(process.env.MONGO_URI || '').trim();
if (/127\.0\.0\.1|localhost/i.test(mongoUri)) {
  console.error('[env-check] MONGO_URI points to localhost. Use a cloud MongoDB URI in production.');
  process.exit(1);
}

const jwtSecret = String(process.env.JWT_SECRET || '').trim();
if (jwtSecret.includes('change_this_in_production') || jwtSecret.length < 16) {
  console.error('[env-check] JWT_SECRET is weak/default. Set a strong secret for production.');
  process.exit(1);
}

console.log('[env-check] Production environment variables look valid.');
