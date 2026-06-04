# InventoryPro — Full-Stack Inventory Management System

Production-ready IMS built with Node.js + Express + MongoDB + React + MUI.

## Tech Stack
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
- Frontend: React 18, Vite, MUI v5, Axios, React Router v6, Chart.js

## Quick Start

### 1. Backend
```bash
cd backend
cp .env.example .env
# Edit .env: set MONGO_URI and JWT_SECRET
npm install
node seed.js       # seed demo data
npm run dev        # starts on :5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev        # starts on :5173
```

## Demo Credentials
| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@inventory.com    | Admin@123  |
| Staff   | staff@inventory.com    | Staff@123  |
| Cashier | cashier@inventory.com  | Cashier@123|

## Features
- JWT auth, role-based access (admin/staff/cashier)
- Full CRUD: Products, Categories, Orders
- Admin-only User Management (no self-registration)
- Stock reservation system (prevents double-selling)
- Dashboard with charts and clickable stats
- Low stock / Out of stock alert pages
- Click categories to browse their products
- POS-style order creation with real-time stock lock

## Role Permissions
| Feature              | Admin | Staff | Cashier |
|----------------------|-------|-------|---------|
| Dashboard/Analytics  |  YES  |  YES  |   NO    |
| Products CRUD        |  YES  |  YES  |  View   |
| Categories CRUD      |  YES  |  YES  |  View   |
| Create Orders (POS)  |  YES  |   NO  |   YES   |
| User Management      |  YES  |   NO  |   NO    |
| Stock Alerts         |  YES  |  YES  |   NO    |

## Stock Reservation
When cashier creates an order -> stock is reserved immediately.
Other cashiers see: availableStock = stock - reservedStock
Complete order -> permanently deducts stock
Cancel order -> releases reservation back to pool

## Color Palette
- #F9F7F7 — Background
- #DBE2EF — Borders / Accents
- #3F72AF — Primary Blue
- #112D4E — Dark Navy (text/headings)
