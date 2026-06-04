const Order = require('../models/Order');
const Product = require('../models/Product');

// Helper: reserve stock (no session needed - uses atomic $inc)
const reserveStock = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error(`Product not found: ${item.product}`);

    const available = product.stock - product.reservedStock;
    if (available < item.quantity) {
      throw new Error(`Insufficient stock for "${product.name}". Available: ${available}, Requested: ${item.quantity}`);
    }

    // Atomic increment of reservedStock
    await Product.findByIdAndUpdate(item.product, {
      $inc: { reservedStock: item.quantity }
    });

    // Attach name/price to item for storage
    item.name = product.name;
    if (!item.price) item.price = product.price;
  }
};

// Helper: release reservation
const releaseReservation = async (items) => {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { reservedStock: -item.quantity }
    });
  }
};

// Helper: deduct stock on completion
const deductStock = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error(`Product not found`);

    if (product.stock < item.quantity) {
      throw new Error(`Not enough stock for "${product.name}"`);
    }

    await Product.findByIdAndUpdate(item.product, {
      $inc: {
        stock: -item.quantity,
        reservedStock: -item.quantity
      }
    });
  }
};

// @route POST /api/orders  — create & reserve
exports.createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, customerName, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }

    // Reserve stock (throws if insufficient)
    await reserveStock(items);

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      items,
      totalAmount,
      status: 'reserved',
      paymentMethod,
      customerName,
      notes,
      cashier: req.user._id,
    });

    await order.populate('cashier', 'name');
    await order.populate('items.product', 'name sku');

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    // If stock was partially reserved before an error, try to roll back
    // (In production, use a proper saga/compensating transaction)
    res.status(400).json({ success: false, message: err.message });
  }
};

// @route GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (req.user.role === 'cashier') query.cashier = req.user._id;

    const orders = await Order.find(query)
      .populate('cashier', 'name employeeId')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);
    res.json({ success: true, count: orders.length, total, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('cashier', 'name employeeId')
      .populate('items.product', 'name sku price');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PATCH /api/orders/:id/complete
exports.completeOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'reserved') {
      return res.status(400).json({ success: false, message: 'Only reserved orders can be completed' });
    }

    await deductStock(order.items);

    order.status = 'completed';
    await order.save();

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @route PATCH /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!['reserved', 'pending'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Only reserved or pending orders can be cancelled' });
    }

    await releaseReservation(order.items);

    order.status = 'cancelled';
    await order.save();

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
