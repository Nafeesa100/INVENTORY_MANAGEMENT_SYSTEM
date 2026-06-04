const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await User.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});

  // Create admin
  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@inventory.com',
    password: 'Admin@123',
    role: 'admin',
    employeeId: 'EMP-0001',
  });
  console.log('✅ Admin created: admin@inventory.com / Admin@123');

  // Create staff
  const staff = await User.create({
    name: 'Stock Manager',
    email: 'staff@inventory.com',
    password: 'Staff@123',
    role: 'staff',
    createdBy: admin._id,
  });

  // Create cashier
  const cashier = await User.create({
    name: 'John Cashier',
    email: 'cashier@inventory.com',
    password: 'Cashier@123',
    role: 'cashier',
    createdBy: admin._id,
  });

  // Create categories
  const categories = await Category.insertMany([
    { name: 'Electronics', description: 'Electronic devices and accessories', icon: 'devices', color: '#3F72AF', createdBy: admin._id },
    { name: 'Clothing', description: 'Apparel and fashion', icon: 'checkroom', color: '#E91E63', createdBy: admin._id },
    { name: 'Food & Beverages', description: 'Consumables and drinks', icon: 'restaurant', color: '#FF9800', createdBy: admin._id },
    { name: 'Furniture', description: 'Home and office furniture', icon: 'chair', color: '#795548', createdBy: admin._id },
    { name: 'Sports', description: 'Sports and fitness equipment', icon: 'fitness_center', color: '#4CAF50', createdBy: admin._id },
  ]);

  // Create products
  const products = [];
  const productData = [
    { name: 'iPhone 15 Pro', category: categories[0]._id, price: 999, costPrice: 750, stock: 25, lowStockThreshold: 5 },
    { name: 'Samsung Galaxy S24', category: categories[0]._id, price: 849, costPrice: 620, stock: 3, lowStockThreshold: 5 },
    { name: 'Sony WH-1000XM5', category: categories[0]._id, price: 349, costPrice: 200, stock: 0, lowStockThreshold: 5 },
    { name: 'MacBook Pro 14"', category: categories[0]._id, price: 1999, costPrice: 1500, stock: 12, lowStockThreshold: 3 },
    { name: 'Nike Air Max 270', category: categories[1]._id, price: 150, costPrice: 80, stock: 45, lowStockThreshold: 10 },
    { name: 'Levi\'s 501 Jeans', category: categories[1]._id, price: 89, costPrice: 40, stock: 8, lowStockThreshold: 10 },
    { name: 'Organic Green Tea', category: categories[2]._id, price: 12, costPrice: 5, stock: 100, lowStockThreshold: 20 },
    { name: 'Premium Coffee Beans', category: categories[2]._id, price: 24, costPrice: 10, stock: 2, lowStockThreshold: 10 },
    { name: 'Ergonomic Office Chair', category: categories[3]._id, price: 450, costPrice: 280, stock: 7, lowStockThreshold: 3 },
    { name: 'Standing Desk', category: categories[3]._id, price: 699, costPrice: 400, stock: 0, lowStockThreshold: 2 },
    { name: 'Yoga Mat Pro', category: categories[4]._id, price: 79, costPrice: 30, stock: 30, lowStockThreshold: 10 },
    { name: 'Dumbbell Set 20kg', category: categories[4]._id, price: 120, costPrice: 60, stock: 15, lowStockThreshold: 5 },
  ];

  for (const p of productData) {
    const product = new Product({ ...p, createdBy: admin._id });
    await product.save();
    products.push(product);
  }

  console.log('✅ Seeded categories and products');
  console.log('\n📋 Login Credentials:');
  console.log('  Admin:   admin@inventory.com / Admin@123');
  console.log('  Staff:   staff@inventory.com / Staff@123');
  console.log('  Cashier: cashier@inventory.com / Cashier@123');

  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
