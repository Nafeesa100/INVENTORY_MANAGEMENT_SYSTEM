#!/bin/bash
# InventoryPro — One-command setup script

echo "======================================"
echo "  InventoryPro Setup"
echo "======================================"

# Backend
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created backend/.env (edit MONGO_URI and JWT_SECRET)"
else
  echo "ℹ️  backend/.env already exists"
fi
cd ..

# Frontend
echo ""
echo "⚛️  Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "======================================"
echo "  Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "  1. Edit backend/.env — set your MONGO_URI"
echo "  2. cd backend && node seed.js   (seed demo data)"
echo "  3. cd backend && npm run dev    (start backend on :5000)"
echo "  4. cd frontend && npm run dev   (start frontend on :5173)"
echo ""
echo "Login: admin@inventory.com / Admin@123"
echo ""
