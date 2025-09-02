const Notice = require('../models/Notice');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/notices');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'notice-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf' || 
                     file.mimetype === 'application/msword' || 
                     file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and document files are allowed'));
    }
  }
});

// @desc    Get all notices with filtering and pagination
// @route   GET /api/notices
// @access  Public
const getNotices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      priority,
      search,
      isActive,
      sort = '-publishDate'
    } = req.query;

    // Build query
    let query = {};

    // Only show active notices for non-admin users
    if (req.user && (req.user.role === 'admin' || req.user.role === 'pastor')) {
      // Admin can see all notices
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }
    } else {
      // Regular users only see active notices
      query.isActive = true;
      query.publishDate = { $lte: new Date() };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Priority filter
    if (priority) {
      query.priority = priority;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination options
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sort,
      populate: [
        { path: 'author', select: 'name email' },
        { path: 'targetAudience.users', select: 'name email' },
        { path: 'targetAudience.roles' }
      ]
    };

    const notices = await Notice.paginate(query, options);

    res.json({
      success: true,
      data: notices.docs,
      pagination: {
        currentPage: notices.page,
        totalPages: notices.totalPages,
        totalNotices: notices.totalDocs,
        hasNext: notices.hasNextPage,
        hasPrev: notices.hasPrevPage,
        nextPage: notices.nextPage,
        prevPage: notices.prevPage
      }
    });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notices'
    });
  }
};

// @desc    Get active notices for public display
// @route   GET /api/notices/active
// @access  Public
const getActiveNotices = async (req, res) => {
  try {
    const { limit = 10, category, priority } = req.query;
    
    let query = {
      isActive: true,
      publishDate: { $lte: new Date() }
    };

    // Add expiry date check
    query.$or = [
      { expiryDate: { $exists: false } },
      { expiryDate: null },
      { expiryDate: { $gte: new Date() } }
    ];

    if (category) {
      query.category = category;
    }

    if (priority) {
      query.priority = priority;
    }

    const notices = await Notice.find(query)
      .sort({ priority: -1, publishDate: -1 })
      .limit(parseInt(limit))
      .populate('author', 'name email');

    res.json({
      success: true,
      data: notices
    });
  } catch (error) {
    console.error('Get active notices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active notices'
    });
  }
};

// @desc    Get single notice
// @route   GET /api/notices/:id
// @access  Public
const getNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('author', 'name email')
      .populate('targetAudience.users', 'name email')
      .populate('readBy.user', 'name email');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Check if notice is active for non-admin users
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'pastor')) {
      if (!notice.isActive || notice.publishDate > new Date()) {
        return res.status(404).json({
          success: false,
          message: 'Notice not found'
        });
      }

      // Check expiry date
      if (notice.expiryDate && notice.expiryDate < new Date()) {
        return res.status(404).json({
          success: false,
          message: 'Notice has expired'
        });
      }
    }

    // Mark as read if user is logged in
    if (req.user && !notice.isReadBy(req.user.id)) {
      notice.readBy.push({
        user: req.user.id,
        readAt: new Date()
      });
      await notice.save();
    }

    res.json({
      success: true,
      data: notice
    });
  } catch (error) {
    console.error('Get notice error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notice'
    });
  }
};

// @desc    Create new notice
// @route   POST /api/notices
// @access  Private (Admin/Pastor)
const createNotice = async (req, res) => {
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
      content,
      summary,
      category,
      priority,
      publishDate,
      expiryDate,
      targetAudience,
      tags,
      isActive
    } = req.body;

    // Create notice object
    const noticeData = {
      title,
      content,
      summary,
      category,
      priority: priority || 'medium',
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      author: req.user.id,
      isActive: isActive !== undefined ? isActive === 'true' : true
    };

    // Add optional fields
    if (expiryDate) noticeData.expiryDate = new Date(expiryDate);
    if (tags) {
      noticeData.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    // Handle target audience
    if (targetAudience) {
      const audience = typeof targetAudience === 'string' ? JSON.parse(targetAudience) : targetAudience;
      noticeData.targetAudience = audience;
    }

    // Handle file upload
    if (req.file) {
      noticeData.attachments = [{
        filename: req.file.originalname,
        path: `uploads/notices/${req.file.filename}`,
        mimetype: req.file.mimetype,
        size: req.file.size
      }];
    }

    const notice = await Notice.create(noticeData);
    
    // Populate the created notice
    await notice.populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      data: notice
    });
  } catch (error) {
    console.error('Create notice error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A notice with this title already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating notice'
    });
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private (Admin/Pastor/Author)
const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Check if user can update this notice
    if (notice.author.toString() !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'pastor') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notice'
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
      content,
      summary,
      category,
      priority,
      publishDate,
      expiryDate,
      targetAudience,
      tags,
      isActive
    } = req.body;

    // Update fields
    if (title) notice.title = title;
    if (content) notice.content = content;
    if (summary) notice.summary = summary;
    if (category) notice.category = category;
    if (priority) notice.priority = priority;
    if (publishDate) notice.publishDate = new Date(publishDate);
    if (expiryDate) notice.expiryDate = new Date(expiryDate);
    if (isActive !== undefined) notice.isActive = isActive === 'true';

    if (tags) {
      notice.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    // Handle target audience
    if (targetAudience) {
      const audience = typeof targetAudience === 'string' ? JSON.parse(targetAudience) : targetAudience;
      notice.targetAudience = audience;
    }

    // Handle file upload
    if (req.file) {
      // Delete old attachments if exists
      if (notice.attachments && notice.attachments.length > 0) {
        notice.attachments.forEach(attachment => {
          const oldFilePath = path.join(__dirname, '..', attachment.path);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        });
      }
      
      notice.attachments = [{
        filename: req.file.originalname,
        path: `uploads/notices/${req.file.filename}`,
        mimetype: req.file.mimetype,
        size: req.file.size
      }];
    }

    notice.updatedAt = new Date();

    await notice.save();
    
    // Populate the updated notice
    await notice.populate('author', 'name email');

    res.json({
      success: true,
      message: 'Notice updated successfully',
      data: notice
    });
  } catch (error) {
    console.error('Update notice error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating notice'
    });
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin/Pastor/Author)
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Check if user can delete this notice
    if (notice.author.toString() !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'pastor') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notice'
      });
    }

    // Delete attachments if exist
    if (notice.attachments && notice.attachments.length > 0) {
      notice.attachments.forEach(attachment => {
        const filePath = path.join(__dirname, '..', attachment.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await Notice.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    console.error('Delete notice error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting notice'
    });
  }
};

// @desc    Mark notice as read
// @route   POST /api/notices/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Check if already marked as read
    if (notice.isReadBy(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Notice already marked as read'
      });
    }

    // Add to read list
    notice.readBy.push({
      user: req.user.id,
      readAt: new Date()
    });

    await notice.save();

    res.json({
      success: true,
      message: 'Notice marked as read',
      data: {
        noticeId: notice._id,
        readAt: new Date()
      }
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking notice as read'
    });
  }
};

// @desc    Get notice statistics
// @route   GET /api/notices/stats
// @access  Private (Admin/Pastor)
const getNoticeStats = async (req, res) => {
  try {
    const totalNotices = await Notice.countDocuments();
    const activeNotices = await Notice.countDocuments({ isActive: true });
    const expiredNotices = await Notice.countDocuments({
      expiryDate: { $lt: new Date() }
    });
    const draftNotices = await Notice.countDocuments({ isActive: false });

    // Notices by category
    const noticesByCategory = await Notice.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Notices by priority
    const noticesByPriority = await Notice.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Monthly notice count for current year
    const currentYear = new Date().getFullYear();
    const monthlyNotices = await Notice.aggregate([
      {
        $match: {
          publishDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$publishDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalNotices,
        activeNotices,
        expiredNotices,
        draftNotices,
        noticesByCategory,
        noticesByPriority,
        monthlyNotices
      }
    });
  } catch (error) {
    console.error('Get notice stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notice statistics'
    });
  }
};

module.exports = {
  getNotices,
  getActiveNotices,
  getNotice,
  createNotice: [upload.single('attachment'), createNotice],
  updateNotice: [upload.single('attachment'), updateNotice],
  deleteNotice,
  markAsRead,
  getNoticeStats
};