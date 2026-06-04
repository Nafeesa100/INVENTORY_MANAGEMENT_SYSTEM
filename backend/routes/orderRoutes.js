const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrder, completeOrder, cancelOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.route('/').get(protect, getOrders).post(protect, authorize('cashier', 'admin'), createOrder);
router.route('/:id').get(protect, getOrder);
router.patch('/:id/complete', protect, authorize('cashier', 'admin'), completeOrder);
router.patch('/:id/cancel', protect, authorize('cashier', 'admin'), cancelOrder);

module.exports = router;
