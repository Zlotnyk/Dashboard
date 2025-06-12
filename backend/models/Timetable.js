import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Subject title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  weekDay: {
    type: String,
    required: [true, 'Week day is required'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  classroom: {
    type: String,
    trim: true,
    maxlength: [50, 'Classroom cannot be more than 50 characters']
  },
  professor: {
    type: String,
    trim: true,
    maxlength: [100, 'Professor name cannot be more than 100 characters']
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [100, 'Subject cannot be more than 100 characters']
  },
  type: {
    type: String,
    enum: ['lecture', 'seminar', 'lab', 'practice', 'exam', 'other'],
    default: 'lecture'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  semester: {
    type: String,
    trim: true
  },
  academicYear: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
timetableSchema.index({ user: 1, weekDay: 1, startTime: 1 });
timetableSchema.index({ user: 1, isActive: 1 });

// Virtual for duration in minutes
timetableSchema.virtual('duration').get(function() {
  if (this.startTime && this.endTime) {
    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return endMinutes - startMinutes;
  }
  return 0;
});

// Virtual for formatted time range
timetableSchema.virtual('timeRange').get(function() {
  if (this.startTime && this.endTime) {
    return `${this.startTime} - ${this.endTime}`;
  }
  return '';
});

// Pre-save middleware to validate times
timetableSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (startMinutes >= endMinutes) {
      next(new Error('End time must be after start time'));
    }
  }
  
  next();
});

// Static method to get user's timetable
timetableSchema.statics.getUserTimetable = function(userId) {
  return this.find({
    user: userId,
    isActive: true
  }).sort({ weekDay: 1, startTime: 1 });
};

// Static method to get timetable for specific day
timetableSchema.statics.getDayTimetable = function(userId, weekDay) {
  return this.find({
    user: userId,
    weekDay: weekDay,
    isActive: true
  }).sort({ startTime: 1 });
};

// Static method to check for time conflicts
timetableSchema.statics.checkTimeConflict = function(userId, weekDay, startTime, endTime, excludeId = null) {
  const query = {
    user: userId,
    weekDay: weekDay,
    isActive: true,
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.findOne(query);
};

export default mongoose.model('Timetable', timetableSchema);