const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Get all users & create user — admin only
router.get('/', protect, authorize('admin'), getUsers);
router.post('/', protect, authorize('admin'), createUser);

// Update — any logged-in user can update their own profile
// Admin can update anyone (logic handled inside controller)
router.put('/:id', protect, updateUser);

// Delete — admin only
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
