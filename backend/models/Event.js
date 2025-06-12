import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  category: {
    type: String,
    enum: ['meeting', 'birthday', 'event', 'other'],
    default: 'event'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  // Birthday specific fields
  isBirthday: {
    type: Boolean,
    default: false
  },
  originalBirthYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  // Event specific fields
  dressCode: {
    type: String,
    trim: true
  },
  numberOfGuests: {
    type: Number,
    min: 0
  },
  theme: {
    type: String,
    trim: true
  },
  comments: {
    type: String,
    trim: true,
    maxlength: [500, 'Comments cannot be more than 500 characters']
  },
  // General fields
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'yearly'
  },
  reminders: [{
    type: Date
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
eventSchema.index({ user: 1, date: 1 });
eventSchema.index({ user: 1, category: 1 });
eventSchema.index({ user: 1, isBirthday: 1 });

// Virtual for days until event
eventSchema.virtual('daysUntil').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(this.date);
  eventDate.setHours(0, 0, 0, 0);
  
  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for current age (for birthdays)
eventSchema.virtual('currentAge').get(function() {
  if (this.isBirthday && this.originalBirthYear) {
    const currentYear = new Date().getFullYear();
    return currentYear - this.originalBirthYear;
  }
  return null;
});

// Virtual for next age (for birthdays)
eventSchema.virtual('nextAge').get(function() {
  if (this.isBirthday && this.originalBirthYear) {
    const eventYear = this.date.getFullYear();
    return eventYear - this.originalBirthYear;
  }
  return null;
});

// Pre-save middleware
eventSchema.pre('save', function(next) {
  if (this.category === 'birthday') {
    this.isBirthday = true;
    this.isRecurring = true;
    this.recurrencePattern = 'yearly';
    
    if (!this.originalBirthYear) {
      this.originalBirthYear = this.date.getFullYear();
    }
  }
  
  next();
});

// Static method to get upcoming events
eventSchema.statics.getUpcomingEvents = function(userId, days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  return this.find({
    user: userId,
    date: { $gte: today, $lte: futureDate }
  }).sort({ date: 1 });
};

// Static method to get birthdays
eventSchema.statics.getUpcomingBirthdays = function(userId, days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  return this.find({
    user: userId,
    isBirthday: true,
    date: { $gte: today, $lte: futureDate }
  }).sort({ date: 1 });
};

export default mongoose.model('Event', eventSchema);