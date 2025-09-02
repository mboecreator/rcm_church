const express = require('express');
const router = express.Router();
const {
  getNotices,
  getActiveNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice,
  markAsRead,
  getNoticeStats
} = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/auth');
const { validateNotice } = require('../middleware/validation');

// Public routes
router.get('/', getNotices);
router.get('/active', getActiveNotices);
router.get('/stats', protect, authorize('admin', 'pastor'), getNoticeStats);
router.get('/:id', getNotice);

// Protected routes
router.post('/', protect, authorize('admin', 'pastor', 'leader'), validateNotice, createNotice);
router.put('/:id', protect, authorize('admin', 'pastor', 'leader'), validateNotice, updateNotice);
router.delete('/:id', protect, authorize('admin', 'pastor', 'leader'), deleteNotice);
router.post('/:id/read', protect, markAsRead);

module.exports = router;