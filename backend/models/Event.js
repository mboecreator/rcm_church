const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: [
      'Revival Crusade',
      'Prayer Meeting',
      'Bible Study',
      'Youth Service',
      'Children Ministry',
      'Community Outreach',
      'Leadership Training',
      'Worship Service',
      'Conference',
      'Special Event',
      'Other'
    ]
  },
  image: {
    type: String,
    default: null
  },
  featured: {
    type: Boolean,
    default: false
  },
  registrationRequired: {
    type: Boolean,
    default: false
  },
  maxAttendees: {
    type: Number,
    default: null
  },
  currentAttendees: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  organizer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  tags: [{
    type: String,
    trim: true
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

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return this.date > new Date() && this.status === 'upcoming';
});

// Virtual for formatted date
eventSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Index for better query performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ featured: 1 });

// Pre-save middleware to update status based on date
eventSchema.pre('save', function(next) {
  const now = new Date();
  const eventDate = new Date(this.date);
  
  if (eventDate < now && this.status === 'upcoming') {
    this.status = 'completed';
  }
  
  next();
});

// Static method to get upcoming events
eventSchema.statics.getUpcoming = function(limit = 10) {
  return this.find({
    date: { $gte: new Date() },
    status: 'upcoming'
  })
  .sort({ date: 1 })
  .limit(limit)
  .populate('createdBy', 'name email');
};

// Static method to get featured events
eventSchema.statics.getFeatured = function() {
  return this.find({
    featured: true,
    date: { $gte: new Date() },
    status: 'upcoming'
  })
  .sort({ date: 1 })
  .populate('createdBy', 'name email');
};

// Static method to get events by category
eventSchema.statics.getByCategory = function(category) {
  return this.find({
    category: category,
    date: { $gte: new Date() },
    status: 'upcoming'
  })
  .sort({ date: 1 })
  .populate('createdBy', 'name email');
};

// Add pagination plugin
eventSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Event', eventSchema);