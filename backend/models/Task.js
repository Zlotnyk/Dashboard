import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: ['Not started', 'In progress', 'Completed', 'On hold'],
    default: 'Not started'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  completedAt: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters']
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative']
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  reminders: [{
    date: Date,
    message: String,
    sent: {
      type: Boolean,
      default: false
    }
  }],
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: function() {
      return this.isRecurring;
    }
  },
  recurringEndDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !this.isRecurring || (value && value > this.endDate);
      },
      message: 'Recurring end date must be after task end date'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
TaskSchema.index({ user: 1, startDate: 1 });
TaskSchema.index({ user: 1, status: 1 });
TaskSchema.index({ user: 1, priority: 1 });
TaskSchema.index({ user: 1, endDate: 1 });

// Virtual for task duration in days
TaskSchema.virtual('durationDays').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for days remaining
TaskSchema.virtual('daysRemaining').get(function() {
  if (this.endDate) {
    const today = new Date();
    const diffTime = this.endDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for completion percentage based on subtasks
TaskSchema.virtual('completionPercentage').get(function() {
  if (this.subtasks && this.subtasks.length > 0) {
    const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedSubtasks / this.subtasks.length) * 100);
  }
  return this.progress || 0;
});

// Pre-save middleware to update progress based on status
TaskSchema.pre('save', function(next) {
  if (this.status === 'Completed' && !this.completedAt) {
    this.completedAt = new Date();
    this.progress = 100;
  } else if (this.status !== 'Completed' && this.completedAt) {
    this.completedAt = undefined;
  }
  
  // Auto-update progress based on subtasks
  if (this.subtasks && this.subtasks.length > 0) {
    const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
    this.progress = Math.round((completedSubtasks / this.subtasks.length) * 100);
    
    // Auto-complete task if all subtasks are done
    if (completedSubtasks === this.subtasks.length && this.status !== 'Completed') {
      this.status = 'Completed';
      this.completedAt = new Date();
    }
  }
  
  next();
});

// Static method to get user's task statistics
TaskSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'In progress'] }, 1, 0] }
        },
        notStarted: {
          $sum: { $cond: [{ $eq: ['$status', 'Not started'] }, 1, 0] }
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ['$endDate', new Date()] },
                  { $ne: ['$status', 'Completed'] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

// Instance method to check if task is overdue
TaskSchema.methods.isOverdue = function() {
  return this.endDate < new Date() && this.status !== 'Completed';
};

// Instance method to get days until due
TaskSchema.methods.getDaysUntilDue = function() {
  const today = new Date();
  const diffTime = this.endDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default mongoose.model('Task', TaskSchema);