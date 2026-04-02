# 🔥 PricePulse — Price Comparison Platform

A full-stack price comparison web app with rewards, wishlist, price history charts, and admin panel.

---

## 📁 Project Structure

```
pricepulse/
├── backend/          ← Node.js + Express + MongoDB
├── frontend/         ← React + Vite + Tailwind CSS
└── database/         ← Seed script (10 products + admin user)
```

---

## ⚙️ Tech Stack

| Layer     | Stack                         |
|-----------|-------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS  |
| Backend   | Node.js, Express.js           |
| Database  | MongoDB Atlas                 |
| Auth      | JWT                           |
| Charts    | Recharts                      |

---

## 🚀 Local Setup (Step by Step)

### 1. Setup MongoDB Atlas (FREE)
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Create a database user (username + password)
4. Click "Connect" → "Drivers" → copy the connection string
5. Replace `<password>` with your actual password

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
npm install
node ../database/seed.js   # Seeds 10 products + admin user
npm start
```

Backend runs at: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# .env should have: VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🌐 Deploy to Vercel

### Deploy Backend

```bash
cd backend
npm install -g vercel
vercel
```

Set these environment variables in Vercel dashboard:
- `MONGO_URI` = your MongoDB Atlas URI
- `JWT_SECRET` = any random string (e.g. use https://randomkeygen.com)
- `CLIENT_URL` = your frontend Vercel URL (set after deploying frontend)
- `NODE_ENV` = production

Note your backend URL: `https://pricepulse-backend.vercel.app`

### Deploy Frontend

```bash
cd frontend
# Create .env.production with your backend URL:
echo "VITE_API_URL=https://YOUR-BACKEND-URL.vercel.app/api" > .env.production
vercel
```

---

## 🔑 Demo Credentials (after seeding)

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Admin | admin@pricepulse.com     | admin123  |

---

## 🎯 Features

| Feature               | Done |
|-----------------------|------|
| Product Search        | ✅   |
| Price Comparison      | ✅   |
| Price History Chart   | ✅   |
| Wishlist              | ✅   |
| Reward Points         | ✅   |
| Wallet & Redemption   | ✅   |
| Notifications         | ✅   |
| User Auth (JWT)       | ✅   |
| Admin Panel           | ✅   |
| Product Compare Page  | ✅   |
| Affiliate Click Track | ✅   |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint                     | Auth     |
|--------|------------------------------|----------|
| POST   | /api/auth/register           | Public   |
| POST   | /api/auth/login              | Public   |
| GET    | /api/auth/me                 | Required |
| GET    | /api/auth/notifications      | Required |
| PUT    | /api/auth/notifications/read | Required |

### Products
| Method | Endpoint                  | Auth     |
|--------|---------------------------|----------|
| GET    | /api/products/featured    | Public   |
| GET    | /api/products/search?q=   | Optional |
| GET    | /api/products/categories  | Public   |
| GET    | /api/products/:id         | Public   |
| POST   | /api/products/:id/click   | Optional |

### Wishlist
| Method | Endpoint                | Auth     |
|--------|-------------------------|----------|
| GET    | /api/wishlist           | Required |
| POST   | /api/wishlist/:id       | Required |
| DELETE | /api/wishlist/:id       | Required |

### Rewards
| Method | Endpoint              | Auth     |
|--------|-----------------------|----------|
| GET    | /api/rewards          | Required |
| POST   | /api/rewards/redeem   | Required |

### Admin
| Method | Endpoint                    | Auth     |
|--------|-----------------------------|----------|
| GET    | /api/admin/stats            | Admin    |
| GET    | /api/admin/users            | Admin    |
| POST   | /api/admin/products         | Admin    |
| PUT    | /api/admin/products/:id     | Admin    |
| DELETE | /api/admin/products/:id     | Admin    |

---

## 💡 Reward System

- User clicks affiliate link → **+5 points**
- 100 points minimum to redeem
- 10 points = ₹1 cashback → added to wallet

---

## 🐛 Common Issues

| Problem | Fix |
|---------|-----|
| CORS error | Set `CLIENT_URL` in backend `.env` to your frontend URL |
| 401 errors | Check `JWT_SECRET` is set in backend env |
| Empty search | Run seed script: `node database/seed.js` |
| MongoDB connect fail | Check `MONGO_URI` in `.env` and IP whitelist in Atlas |
