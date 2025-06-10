import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['Not started', 'In progress', 'Completed', 'On hold'],
    default: 'Not started'
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent'],
    default: 'normal'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  tags: [{
    type: String,
    trim: true
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
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  dueDate: Date,
  reminders: [{
    type: Date
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
taskSchema.index({ user: 1, startDate: 1 });
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, isCompleted: 1 });

// Virtual for task duration in days
taskSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  }
  return 0;
});

// Virtual for days until due date
taskSchema.virtual('daysUntilDue').get(function() {
  if (this.dueDate) {
    const today = new Date();
    const diffTime = this.dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (this.dueDate && !this.isCompleted) {
    return new Date() > this.dueDate;
  }
  return false;
});

// Pre-save middleware to validate dates
taskSchema.pre('save', function(next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    next(new Error('End date must be after start date'));
  }
  
  if (this.isCompleted && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  if (!this.isCompleted && this.completedAt) {
    this.completedAt = undefined;
  }
  
  next();
});

// Static method to get user's active tasks
taskSchema.statics.getActiveTasks = function(userId) {
  return this.find({
    user: userId,
    isCompleted: false
  }).sort({ priority: -1, startDate: 1 });
};

// Static method to get today's tasks
taskSchema.statics.getTodaysTasks = function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    user: userId,
    startDate: { $lte: tomorrow },
    endDate: { $gte: today },
    isCompleted: false
  }).sort({ priority: -1, startDate: 1 });
};

export default mongoose.model('Task', taskSchema);