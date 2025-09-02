const express = require('express');
const router = express.Router();
const {
  getUsers,
  getMembers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  getUserStats,
  getProfile,
  updateProfile
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { validateUser, validateUserCreation, validateProfileUpdate } = require('../middleware/validation');

// Profile routes (current user)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateProfileUpdate, updateProfile);

// Admin/Pastor routes
router.get('/', protect, authorize('admin', 'pastor'), getUsers);
router.get('/members', protect, authorize('admin', 'pastor'), getMembers);
router.get('/stats', protect, authorize('admin', 'pastor'), getUserStats);
router.post('/', protect, authorize('admin', 'pastor'), validateUserCreation, createUser);

// User management routes
router.get('/:id', protect, getUser);
router.put('/:id', protect, validateUser, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.put('/:id/password', protect, changePassword);

module.exports = router;