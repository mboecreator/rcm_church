const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'pastor', 'leader', 'member'],
    default: 'member'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  dateOfBirth: {
    type: Date
  },
  membershipDate: {
    type: Date,
    default: Date.now
  },
  ministries: [{
    type: String,
    enum: [
      'Worship Team',
      'Youth Ministry',
      'Children Ministry',
      'Prayer Team',
      'Outreach Team',
      'Media Team',
      'Ushering Team',
      'Counseling Team',
      'Administrative Team'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profileImage: {
    type: String,
    default: null
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    eventReminders: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, zipCode, country } = this.address;
  return [street, city, state, zipCode, country].filter(Boolean).join(', ');
});

// Virtual for age
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has permission
userSchema.methods.hasPermission = function(requiredRole) {
  const roleHierarchy = {
    'member': 1,
    'leader': 2,
    'pastor': 3,
    'admin': 4
  };
  
  return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
};

// Static method to create admin user
userSchema.statics.createAdmin = async function(adminData) {
  const existingAdmin = await this.findOne({ role: 'admin' });
  if (existingAdmin) {
    throw new Error('Admin user already exists');
  }
  
  const admin = new this({
    ...adminData,
    role: 'admin'
  });
  
  return await admin.save();
};

// Static method to get members by ministry
userSchema.statics.getByMinistry = function(ministry) {
  return this.find({
    ministries: ministry,
    isActive: true
  }).select('-password');
};

// Static method to get active members
userSchema.statics.getActiveMembers = function() {
  return this.find({
    isActive: true,
    role: { $ne: 'admin' }
  }).select('-password');
};

// Add pagination plugin
userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', userSchema);