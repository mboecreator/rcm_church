const { body } = require('express-validator');

// Event validation rules
const validateEvent = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('category')
    .isIn([
      'Revival Crusade',
      'Prayer Meeting',
      'Bible Study',
      'Youth Service',
      'Children Ministry',
      'Community Outreach',
      'Leadership Training',
      'Worship Service',
      'Conference',
      'Special Event'
    ])
    .withMessage('Invalid event category'),
  
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),
  
  body('location')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Location must be between 3 and 200 characters'),
  
  body('maxAttendees')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max attendees must be a positive integer'),
  
  body('registrationRequired')
    .optional()
    .isBoolean()
    .withMessage('Registration required must be a boolean'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean')
];

// Notice validation rules
const validateNotice = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  
  body('summary')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Summary must not exceed 500 characters'),
  
  body('category')
    .isIn([
      'General Announcement',
      'Service Update',
      'Ministry News',
      'Prayer Request',
      'Community News',
      'Emergency Notice',
      'Event Reminder',
      'Policy Update',
      'Celebration'
    ])
    .withMessage('Invalid notice category'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  
  body('publishDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid publish date format'),
  
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date format'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Active status must be a boolean')
];

// User validation rules
const validateUser = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  
  body('maritalStatus')
    .optional()
    .isIn(['Single', 'Married', 'Divorced', 'Widowed'])
    .withMessage('Invalid marital status'),
  
  body('role')
    .optional()
    .isIn(['member', 'leader', 'pastor', 'admin'])
    .withMessage('Invalid role'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date of birth format'),
  
  body('membershipDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid membership date format'),
  
  body('baptismDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid baptism date format'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Active status must be a boolean')
];

// User creation validation (requires password)
const validateUserCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  
  body('maritalStatus')
    .optional()
    .isIn(['Single', 'Married', 'Divorced', 'Widowed'])
    .withMessage('Invalid marital status'),
  
  body('role')
    .optional()
    .isIn(['member', 'leader', 'pastor', 'admin'])
    .withMessage('Invalid role'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date of birth format'),
  
  body('membershipDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid membership date format'),
  
  body('baptismDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid baptism date format'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Active status must be a boolean')
];

// Login validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Registration validation rules
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  
  body('maritalStatus')
    .optional()
    .isIn(['Single', 'Married', 'Divorced', 'Widowed'])
    .withMessage('Invalid marital status'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date of birth format')
];

// Password change validation rules
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

// Profile update validation rules
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  
  body('maritalStatus')
    .optional()
    .isIn(['Single', 'Married', 'Divorced', 'Widowed'])
    .withMessage('Invalid marital status'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date of birth format')
];

// Contact form validation rules
const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('subject')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Subject must be between 3 and 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

module.exports = {
  validateEvent,
  validateNotice,
  validateUser,
  validateUserCreation,
  validateLogin,
  validateRegistration,
  validatePasswordChange,
  validateProfileUpdate,
  validateContact
};