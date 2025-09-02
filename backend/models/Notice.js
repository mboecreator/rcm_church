const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Notice content is required'],
    trim: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Notice category is required'],
    enum: [
      'General Announcement',
      'Service Update',
      'Ministry News',
      'Prayer Request',
      'Community News',
      'Emergency Notice',
      'Event Reminder',
      'Policy Update',
      'Celebration',
      'Other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'members', 'leaders', 'youth', 'children', 'adults', 'seniors'],
    default: 'all'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: null
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if notice is expired
noticeSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return this.expiryDate < new Date();
});

// Virtual for read count
noticeSchema.virtual('readCount').get(function() {
  return this.readBy.length;
});

// Virtual for formatted publish date
noticeSchema.virtual('formattedPublishDate').get(function() {
  return this.publishDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Index for better query performance
noticeSchema.index({ publishDate: -1 });
noticeSchema.index({ category: 1 });
noticeSchema.index({ priority: 1 });
noticeSchema.index({ isActive: 1 });
noticeSchema.index({ isPinned: 1 });
noticeSchema.index({ targetAudience: 1 });

// Pre-save middleware to check expiry
noticeSchema.pre('save', function(next) {
  if (this.expiryDate && this.expiryDate < new Date()) {
    this.isActive = false;
  }
  next();
});

// Static method to get active notices
noticeSchema.statics.getActive = function(targetAudience = 'all') {
  const query = {
    isActive: true,
    publishDate: { $lte: new Date() }
  };
  
  if (targetAudience !== 'all') {
    query.$or = [
      { targetAudience: 'all' },
      { targetAudience: targetAudience }
    ];
  }
  
  return this.find(query)
    .sort({ isPinned: -1, priority: -1, publishDate: -1 })
    .populate('createdBy', 'name email role');
};

// Static method to get pinned notices
noticeSchema.statics.getPinned = function() {
  return this.find({
    isPinned: true,
    isActive: true,
    publishDate: { $lte: new Date() }
  })
  .sort({ publishDate: -1 })
  .populate('createdBy', 'name email role');
};

// Static method to get notices by category
noticeSchema.statics.getByCategory = function(category) {
  return this.find({
    category: category,
    isActive: true,
    publishDate: { $lte: new Date() }
  })
  .sort({ publishDate: -1 })
  .populate('createdBy', 'name email role');
};

// Method to mark as read by user
noticeSchema.methods.markAsRead = function(userId) {
  const alreadyRead = this.readBy.some(read => read.user.toString() === userId.toString());
  
  if (!alreadyRead) {
    this.readBy.push({ user: userId });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to check if read by user
noticeSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Add pagination plugin
noticeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Notice', noticeSchema);