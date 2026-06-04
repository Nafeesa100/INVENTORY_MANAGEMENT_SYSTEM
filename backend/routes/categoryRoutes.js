const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getCategories)
  .post(protect, authorize('admin', 'staff'), createCategory);

router.route('/:id')
  .put(protect, authorize('admin', 'staff'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
