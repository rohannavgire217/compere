const isDeployBuild = process.env.CI === 'true' || process.env.VERCEL === '1';

if (!isDeployBuild) {
  process.exit(0);
}

const value = String(process.env.VITE_API_URL || '').trim();

if (!value) {
  console.error('[env-check] VITE_API_URL is missing for deployment build.');
  process.exit(1);
}

if (/your-backend\.vercel\.app/i.test(value) || /<your-backend-domain>/i.test(value)) {
  console.error('[env-check] VITE_API_URL is still placeholder text. Set your real backend domain.');
  process.exit(1);
}

if (!/^https:\/\//i.test(value)) {
  console.error('[env-check] VITE_API_URL should start with https:// for production builds.');
  process.exit(1);
}

console.log('[env-check] Frontend deployment environment variables look valid.');
