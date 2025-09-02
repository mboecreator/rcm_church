const express = require('express');
const router = express.Router();
const {
  getEvents,
  getFeaturedEvents,
  getUpcomingEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getEventStats
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const { validateEvent } = require('../middleware/validation');

// Public routes
router.get('/', getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/stats', protect, authorize('admin', 'pastor'), getEventStats);
router.get('/:id', getEvent);

// Protected routes
router.post('/', protect, authorize('admin', 'pastor', 'leader'), validateEvent, createEvent);
router.put('/:id', protect, authorize('admin', 'pastor', 'leader'), validateEvent, updateEvent);
router.delete('/:id', protect, authorize('admin', 'pastor', 'leader'), deleteEvent);
router.post('/:id/register', protect, registerForEvent);

module.exports = router;