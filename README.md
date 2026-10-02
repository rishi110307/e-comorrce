# E-commerce Starter — React + Vite + Express + PostgreSQL

A starter storefront prepared for deployment on Render. It includes product listing/search, category filters, a shopping cart, and a basic order-creation API.

## Project structure

- `frontend/` — React + Vite storefront
- `backend/` — Express REST API + PostgreSQL
- `render.yaml` — optional Render Blueprint starting point

## Run locally

### 1. Create a PostgreSQL database
Create a local database named `ecommerce`, then set `backend/.env` using `backend/.env.example` as a guide.

### 2. Start the backend
```bash
cd backend
npm install
# Copy .env.example to .env and set DATABASE_URL
npm run dev
```
API: `http://localhost:5000`  
Health check: `http://localhost:5000/api/health`

### 3. Start the frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend: `http://localhost:5173`

The Vite development server proxies `/api` requests to the local backend.

## Deploy on Render

### Backend
1. Push this project to GitHub.
2. In Render, choose **New → PostgreSQL** and create a database.
3. Choose **New → Web Service** and connect your repository.
4. Set **Root Directory** to `backend`.
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variable `DATABASE_URL` using the database's **Internal Database URL**.
8. Add `NODE_ENV=production`.
9. Deploy. The backend creates the `products` and `orders` tables and inserts sample products on startup.

### Frontend
1. Choose **New → Static Site** and connect the same repository.
2. Set **Root Directory** to `frontend`.
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add environment variable `VITE_API_URL` with your backend URL, for example `https://your-api-name.onrender.com/api`.
6. Deploy.

After setting `VITE_API_URL`, redeploy the frontend so the build includes it.

## Important notes
- This is a learning/demo starter, not a production-ready store.
- Orders are created without a payment gateway. Do not collect card details in this app.
- Before real public use, add authentication, admin authorization, input validation, rate limiting, secure order management, tax/shipping rules, and a trusted payment provider.
- Never commit `.env` files or database passwords to GitHub.
