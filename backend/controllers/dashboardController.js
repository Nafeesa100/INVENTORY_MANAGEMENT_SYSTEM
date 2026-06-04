const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalProducts,
      totalCategories,
      totalUsers,
      outOfStock,
      lowStock,
      reservedOrders,
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Category.countDocuments(),
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ stock: 0, isActive: true }),
      Product.countDocuments({ $expr: { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$lowStockThreshold'] }] }, isActive: true }),
      Order.countDocuments({ status: 'reserved' }),
    ]);

    // Inventory value
    const inventoryAgg = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$stock', '$price'] } } } },
    ]);
    const inventoryValue = inventoryAgg[0]?.totalValue || 0;

    // Today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = await Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, name: { $first: '$items.name' } } },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true,
      stock: { $gt: 0 },
    }).populate('category', 'name color').limit(10).sort({ stock: 1 });

    // Out of stock products
    const outOfStockProducts = await Product.find({ stock: 0, isActive: true })
      .populate('category', 'name color').limit(10);

    res.json({
      success: true,
      data: {
        stats: { totalProducts, totalCategories, totalUsers, outOfStock, lowStock, reservedOrders, inventoryValue, todayRevenue: todayRevenue[0]?.total || 0 },
        monthlyRevenue,
        topProducts,
        lowStockProducts,
        outOfStockProducts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
