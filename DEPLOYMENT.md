# Deployment Guide

PricePulse is deployed as two separate Vercel projects:

## 1) Backend Project

Set the project root to `backend`.

Vercel project settings:
- Framework Preset: `Other`
- Install Command: `npm install`
- Build Command: none
- Output Directory: leave empty

Environment variables:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_jwt_secret
CLIENT_URLS=https://your-frontend.vercel.app,https://*.vercel.app
NODE_ENV=production
```

Notes:
- Do not use the local MongoDB URI in production.
- If you want to allow local development too, you can set `CLIENT_URLS` to a comma-separated list.
- Example: `CLIENT_URLS=https://your-frontend.vercel.app,http://localhost:5173`
- Wildcards are supported. Example for Vercel previews: `CLIENT_URLS=https://your-frontend.vercel.app,https://*.vercel.app`
- Do not include spaces in domain values (for example, `https:// compare.vercel.app` is invalid).
- Backend startup now fails fast in production if `MONGO_URI`/`JWT_SECRET` are missing or invalid.

Health check:
- `https://your-backend-domain.vercel.app/api/health`

## 2) Frontend Project

Set the project root to `frontend`.

Vercel project settings:
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variables:

```env
VITE_API_URL=https://your-backend-domain.vercel.app/api
```

Important:
- Replace placeholder text with your actual deployed backend URL from Vercel.
- `https://your-backend.vercel.app` is only an example and will return `404 NOT_FOUND`.
- Frontend build now fails in CI/Vercel if `VITE_API_URL` is missing, placeholder, or not `https://`.

Build settings:
- Build command: `npm run build`
- Output directory: `dist`

## 3) Common Deployment Problems

- `DEPLOYMENT_NOT_FOUND`: wrong Vercel domain or deployment not ready.
- `401 Unauthorized` on the site: Vercel Deployment Protection is enabled.
- `500` on `/api/*`: backend env vars are missing or `VITE_API_URL` points to the wrong backend.
- CORS errors: add the frontend domain to `CLIENT_URLS`.
- If preview deployments fail login, include `https://*.vercel.app` in `CLIENT_URLS`.

## 4) Rapid Triage Checklist

1. Environment variables
- Confirm backend has: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URLS`, `NODE_ENV=production`.
- Confirm frontend has: `VITE_API_URL` (and optional `VITE_API_KEY`).
- Never use local Mongo values (`127.0.0.1`) in cloud deployments.

2. Runtime and port binding
- Backend should use platform `PORT` and bind to `0.0.0.0`.
- In this project, server startup now binds host from `HOST` or defaults to `0.0.0.0`.

3. Silent frontend checks
- Open browser DevTools Console and Network tabs.
- If you see CORS errors, add the exact frontend deployment URL to `CLIENT_URLS`.
- If JS assets 404, verify Vercel project root and frontend build output (`dist`).

4. Backend health checks
- Test API directly: `https://<backend-domain>/api/health`.
- Alternate check: `https://<backend-domain>/health`.
- If request times out, verify server process/start command in platform logs.

5. Database connectivity
- Ensure DB network access allows your deployment platform.
- For Atlas troubleshooting, temporarily allow `0.0.0.0/0` and tighten after verification.
- If login/write paths fail only in production, re-check DB URI and access rules first.

## 5) Optional API Key

If you want to protect engine routes only, set:

Backend:

```env
API_KEY=your_optional_api_key_for_service_clients
```

Frontend:

```env
VITE_API_KEY=your_optional_api_key_for_service_clients
```

This sends `x-api-key` from the frontend client and checks it only on `/api/engine/*` routes.

## 6) Recommended Flow

1. Deploy backend.
2. Confirm `/api/health` works.
3. Copy the backend URL into `VITE_API_URL`.
4. Redeploy frontend.
5. Open the frontend and test login.
