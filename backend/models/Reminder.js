import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Reminder title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  type: {
    type: String,
    enum: ['exam', 'assignment', 'general'],
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
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
  status: {
    type: String,
    enum: ['Not started', 'In progress', 'Completed', 'Submitted'],
    default: 'Not started'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  // Exam specific fields
  subject: {
    type: String,
    trim: true,
    maxlength: [100, 'Subject cannot be more than 100 characters']
  },
  examType: {
    type: String,
    enum: ['midterm', 'final', 'quiz', 'practical', 'oral', 'other']
  },
  attended: {
    type: Boolean,
    default: false
  },
  grade: {
    type: String,
    trim: true
  },
  // Assignment specific fields
  course: {
    type: String,
    trim: true,
    maxlength: [100, 'Course cannot be more than 100 characters']
  },
  assignmentType: {
    type: String,
    enum: ['essay', 'project', 'homework', 'presentation', 'lab', 'other']
  },
  submitted: {
    type: Boolean,
    default: false
  },
  submissionDate: Date,
  // Notification settings
  notifications: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms'],
      default: 'push'
    },
    timing: {
      type: String,
      enum: ['1hour', '1day', '3days', '1week', 'custom'],
      default: '1day'
    },
    customDate: Date,
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
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
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
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
reminderSchema.index({ user: 1, dueDate: 1 });
reminderSchema.index({ user: 1, type: 1 });
reminderSchema.index({ user: 1, isCompleted: 1 });
reminderSchema.index({ user: 1, priority: 1 });

// Virtual for days until due
reminderSchema.virtual('daysUntilDue').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(this.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for urgency status
reminderSchema.virtual('isUrgent').get(function() {
  const daysUntil = this.daysUntilDue;
  return daysUntil <= 1 && !this.isCompleted;
});

// Virtual for overdue status
reminderSchema.virtual('isOverdue').get(function() {
  const today = new Date();
  return this.dueDate < today && !this.isCompleted;
});

// Virtual for priority color
reminderSchema.virtual('priorityColor').get(function() {
  const colors = {
    'low': '#10b981',
    'medium': '#f59e0b',
    'high': '#f97316',
    'urgent': '#ef4444'
  };
  return colors[this.priority] || '#6b7280';
});

// Pre-save middleware
reminderSchema.pre('save', function(next) {
  if (this.isCompleted && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  if (!this.isCompleted && this.completedAt) {
    this.completedAt = undefined;
  }
  
  // Set submitted date for assignments
  if (this.type === 'assignment' && this.submitted && !this.submissionDate) {
    this.submissionDate = new Date();
  }
  
  next();
});

// Static method to get urgent reminders
reminderSchema.statics.getUrgentReminders = function(userId) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);
  
  return this.find({
    user: userId,
    dueDate: { $lte: tomorrow },
    isCompleted: false
  }).sort({ dueDate: 1 });
};

// Static method to get reminders by type
reminderSchema.statics.getRemindersByType = function(userId, type) {
  return this.find({
    user: userId,
    type: type,
    isCompleted: false
  }).sort({ dueDate: 1 });
};

// Static method to get upcoming reminders
reminderSchema.statics.getUpcomingReminders = function(userId, days = 7) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  return this.find({
    user: userId,
    dueDate: { $gte: today, $lte: futureDate },
    isCompleted: false
  }).sort({ dueDate: 1 });
};

export default mongoose.model('Reminder', reminderSchema);