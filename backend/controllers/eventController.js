const Event = require('../models/Event');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/events');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// @desc    Get all events with filtering and pagination
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      search,
      startDate,
      endDate,
      sort = '-createdAt',
      featured
    } = req.query;

    // Build query
    let query = {};

    // Category filter
    if (category) {
      query.category = category;
    }

    // Status filter
    if (status) {
      if (status === 'upcoming') {
        query.date = { $gte: new Date() };
        query.status = 'upcoming';
      } else {
        query.status = status;
      }
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination options
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sort,
      populate: [
        { path: 'createdBy', select: 'name email' },
        { path: 'organizer', select: 'name email phone' }
      ]
    };

    const events = await Event.paginate(query, options);

    res.json({
      success: true,
      data: events.docs,
      pagination: {
        currentPage: events.page,
        totalPages: events.totalPages,
        totalEvents: events.totalDocs,
        hasNext: events.hasNextPage,
        hasPrev: events.hasPrevPage,
        nextPage: events.nextPage,
        prevPage: events.prevPage
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events'
    });
  }
};

// @desc    Get featured events
// @route   GET /api/events/featured
// @access  Public
const getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.find({
      isFeatured: true,
      date: { $gte: new Date() },
      status: 'upcoming'
    })
    .sort({ date: 1 })
    .limit(6)
    .populate('createdBy', 'name email')
    .populate('organizer', 'name email phone');

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get featured events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured events'
    });
  }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Public
const getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 10, category } = req.query;
    
    let query = {
      date: { $gte: new Date() },
      status: 'upcoming'
    };

    if (category) {
      query.category = category;
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('organizer', 'name email phone');

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming events'
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('organizer', 'name email phone');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Get event error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event'
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin/Pastor)
const createEvent = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      category,
      date,
      time,
      location,
      organizer,
      registrationRequired,
      maxAttendees,
      tags,
      isFeatured
    } = req.body;

    // Create event object
    const eventData = {
      title,
      description,
      category,
      date: new Date(date),
      time,
      location,
      organizer: organizer || req.user.id,
      createdBy: req.user.id,
      registrationRequired: registrationRequired === 'true',
      isFeatured: isFeatured === 'true'
    };

    // Add optional fields
    if (maxAttendees) eventData.maxAttendees = parseInt(maxAttendees);
    if (tags) {
      eventData.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    // Handle image upload
    if (req.file) {
      eventData.image = `uploads/events/${req.file.filename}`;
    }

    // Set status based on date
    const eventDate = new Date(date);
    const now = new Date();
    
    if (eventDate > now) {
      eventData.status = 'upcoming';
    } else if (eventDate.toDateString() === now.toDateString()) {
      eventData.status = 'ongoing';
    } else {
      eventData.status = 'completed';
    }

    const event = await Event.create(eventData);
    
    // Populate the created event
    await event.populate('createdBy', 'name email');
    await event.populate('organizer', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Create event error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An event with this title already exists for this date'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating event'
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin/Pastor/Organizer)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user can update this event
    if (event.createdBy.toString() !== req.user.id && 
        event.organizer.toString() !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'pastor') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      category,
      date,
      time,
      location,
      organizer,
      registrationRequired,
      maxAttendees,
      tags,
      isFeatured,
      status
    } = req.body;

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (date) {
      event.date = new Date(date);
      // Auto-update status based on new date
      const eventDate = new Date(date);
      const now = new Date();
      
      if (eventDate > now) {
        event.status = 'upcoming';
      } else if (eventDate.toDateString() === now.toDateString()) {
        event.status = 'ongoing';
      } else {
        event.status = 'completed';
      }
    }
    if (time) event.time = time;
    if (location) event.location = location;
    if (organizer) event.organizer = organizer;
    if (registrationRequired !== undefined) event.registrationRequired = registrationRequired === 'true';
    if (maxAttendees) event.maxAttendees = parseInt(maxAttendees);
    if (isFeatured !== undefined) event.isFeatured = isFeatured === 'true';
    if (status) event.status = status;

    if (tags) {
      event.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (event.image) {
        const oldImagePath = path.join(__dirname, '..', event.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      event.image = `uploads/events/${req.file.filename}`;
    }

    event.updatedAt = new Date();

    await event.save();
    
    // Populate the updated event
    await event.populate('createdBy', 'name email');
    await event.populate('organizer', 'name email phone');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Update event error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating event'
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin/Pastor/Organizer)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user can delete this event
    if (event.createdBy.toString() !== req.user.id && 
        event.organizer.toString() !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'pastor') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    // Delete image if exists
    if (event.image) {
      const imagePath = path.join(__dirname, '..', event.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting event'
    });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.registrationRequired) {
      return res.status(400).json({
        success: false,
        message: 'Registration is not required for this event'
      });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for this event'
      });
    }

    // Check if already registered
    const alreadyRegistered = event.attendees.some(
      attendee => attendee.user.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check capacity
    if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'Event is at full capacity'
      });
    }

    // Add user to attendees
    event.attendees.push({
      user: req.user.id,
      registeredAt: new Date()
    });

    event.currentAttendees = event.attendees.length;

    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered for event',
      data: {
        eventId: event._id,
        eventTitle: event.title,
        registeredAt: new Date()
      }
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while registering for event'
    });
  }
};

// @desc    Get event statistics
// @route   GET /api/events/stats
// @access  Private (Admin/Pastor)
const getEventStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({
      date: { $gte: new Date() },
      status: 'upcoming'
    });
    const featuredEvents = await Event.countDocuments({ isFeatured: true });
    const completedEvents = await Event.countDocuments({ status: 'completed' });

    // Events by category
    const eventsByCategory = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Monthly event count for current year
    const currentYear = new Date().getFullYear();
    const monthlyEvents = await Event.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalEvents,
        upcomingEvents,
        featuredEvents,
        completedEvents,
        eventsByCategory,
        monthlyEvents
      }
    });
  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event statistics'
    });
  }
};

module.exports = {
  getEvents,
  getFeaturedEvents,
  getUpcomingEvents,
  getEvent,
  createEvent: [upload.single('image'), createEvent],
  updateEvent: [upload.single('image'), updateEvent],
  deleteEvent,
  registerForEvent,
  getEventStats
};