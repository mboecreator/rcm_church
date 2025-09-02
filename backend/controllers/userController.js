const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
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

// @desc    Get all users with filtering and pagination
// @route   GET /api/users
// @access  Private (Admin/Pastor)
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      isActive,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = {};

    // Role filter
    if (role) {
      query.role = role;
    }

    // Active status filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination options
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sort,
      select: '-password' // Exclude password field
    };

    const users = await User.paginate(query, options);

    res.json({
      success: true,
      data: users.docs,
      pagination: {
        currentPage: users.page,
        totalPages: users.totalPages,
        totalUsers: users.totalDocs,
        hasNext: users.hasNextPage,
        hasPrev: users.hasPrevPage,
        nextPage: users.nextPage,
        prevPage: users.prevPage
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

// @desc    Get church members (non-admin users)
// @route   GET /api/users/members
// @access  Private (Admin/Pastor)
const getMembers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      sort = 'name'
    } = req.query;

    // Build query for members only
    let query = {
      role: { $in: ['member', 'leader'] }
    };

    // Active status filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination options
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sort,
      select: '-password' // Exclude password field
    };

    const members = await User.paginate(query, options);

    res.json({
      success: true,
      data: members.docs,
      pagination: {
        currentPage: members.page,
        totalPages: members.totalPages,
        totalMembers: members.totalDocs,
        hasNext: members.hasNextPage,
        hasPrev: members.hasPrevPage,
        nextPage: members.nextPage,
        prevPage: members.prevPage
      }
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching members'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin/Pastor or own profile)
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can view this profile
    if (req.user.id !== req.params.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'pastor') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this profile'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
};

// @desc    Create new user/member
// @route   POST /api/users
// @access  Private (Admin/Pastor)
const createUser = async (req, res) => {
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
      name,
      email,
      password,
      phone,
      address,
      dateOfBirth,
      gender,
      maritalStatus,
      occupation,
      emergencyContact,
      role,
      membershipDate,
      baptismDate,
      ministries,
      skills,
      isActive
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user object
    const userData = {
      name,
      email,
      password,
      phone,
      address,
      gender,
      maritalStatus,
      occupation,
      role: role || 'member',
      membershipDate: membershipDate ? new Date(membershipDate) : new Date(),
      isActive: isActive !== undefined ? isActive === 'true' : true
    };

    // Add optional fields
    if (dateOfBirth) userData.dateOfBirth = new Date(dateOfBirth);
    if (baptismDate) userData.baptismDate = new Date(baptismDate);
    if (emergencyContact) userData.emergencyContact = emergencyContact;
    if (ministries) {
      userData.ministries = typeof ministries === 'string' ? ministries.split(',').map(m => m.trim()) : ministries;
    }
    if (skills) {
      userData.skills = typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills;
    }

    // Handle profile picture upload
    if (req.file) {
      userData.profilePicture = `uploads/profiles/${req.file.filename}`;
    }

    const user = await User.create(userData);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating user'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin/Pastor or own profile)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can update this profile
    if (req.user.id !== req.params.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'pastor') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
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
      name,
      email,
      phone,
      address,
      dateOfBirth,
      gender,
      maritalStatus,
      occupation,
      emergencyContact,
      role,
      membershipDate,
      baptismDate,
      ministries,
      skills,
      isActive
    } = req.body;

    // Update fields
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
      user.email = email;
    }
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (gender) user.gender = gender;
    if (maritalStatus) user.maritalStatus = maritalStatus;
    if (occupation) user.occupation = occupation;
    if (emergencyContact) user.emergencyContact = emergencyContact;
    if (membershipDate) user.membershipDate = new Date(membershipDate);
    if (baptismDate) user.baptismDate = new Date(baptismDate);

    // Only admin/pastor can change role and active status
    if (req.user.role === 'admin' || req.user.role === 'pastor') {
      if (role) user.role = role;
      if (isActive !== undefined) user.isActive = isActive === 'true';
    }

    if (ministries) {
      user.ministries = typeof ministries === 'string' ? ministries.split(',').map(m => m.trim()) : ministries;
    }
    if (skills) {
      user.skills = typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills;
    }

    // Handle profile picture upload
    if (req.file) {
      // Delete old profile picture if exists
      if (user.profilePicture) {
        const oldImagePath = path.join(__dirname, '..', user.profilePicture);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      user.profilePicture = `uploads/profiles/${req.file.filename}`;
    }

    user.updatedAt = new Date();

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting own account
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete profile picture if exists
    if (user.profilePicture) {
      const imagePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
};

// @desc    Change user password
// @route   PUT /api/users/:id/password
// @access  Private (Admin/Pastor or own profile)
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can change this password
    if (req.user.id !== req.params.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'pastor') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to change this password'
      });
    }

    const { currentPassword, newPassword } = req.body;

    // If changing own password, verify current password
    if (req.user.id === req.params.id) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required'
        });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin/Pastor)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    
    // Users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Users by gender
    const usersByGender = await User.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Users by marital status
    const usersByMaritalStatus = await User.aggregate([
      {
        $group: {
          _id: '$maritalStatus',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Monthly registration count for current year
    const currentYear = new Date().getFullYear();
    const monthlyRegistrations = await User.aggregate([
      {
        $match: {
          membershipDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$membershipDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent members (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentMembers = await User.countDocuments({
      membershipDate: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        recentMembers,
        usersByRole,
        usersByGender,
        usersByMaritalStatus,
        monthlyRegistrations
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics'
    });
  }
};

// @desc    Get user profile (current user)
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// @desc    Update user profile (current user)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const {
      name,
      email,
      phone,
      address,
      dateOfBirth,
      gender,
      maritalStatus,
      occupation,
      emergencyContact,
      ministries,
      skills
    } = req.body;

    // Update fields
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
      user.email = email;
    }
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (gender) user.gender = gender;
    if (maritalStatus) user.maritalStatus = maritalStatus;
    if (occupation) user.occupation = occupation;
    if (emergencyContact) user.emergencyContact = emergencyContact;

    if (ministries) {
      user.ministries = typeof ministries === 'string' ? ministries.split(',').map(m => m.trim()) : ministries;
    }
    if (skills) {
      user.skills = typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills;
    }

    // Handle profile picture upload
    if (req.file) {
      // Delete old profile picture if exists
      if (user.profilePicture) {
        const oldImagePath = path.join(__dirname, '..', user.profilePicture);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      user.profilePicture = `uploads/profiles/${req.file.filename}`;
    }

    user.updatedAt = new Date();

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

module.exports = {
  getUsers,
  getMembers,
  getUser,
  createUser: [upload.single('profilePicture'), createUser],
  updateUser: [upload.single('profilePicture'), updateUser],
  deleteUser,
  changePassword,
  getUserStats,
  getProfile,
  updateProfile: [upload.single('profilePicture'), updateProfile]
};