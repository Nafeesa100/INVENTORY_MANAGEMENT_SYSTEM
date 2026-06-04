const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getProducts)
  .post(protect, authorize('admin', 'staff'), createProduct);

router.route('/:id')
  .get(protect, getProduct)
  .put(protect, authorize('admin', 'staff'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
