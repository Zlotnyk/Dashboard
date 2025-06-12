import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Trip title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
    maxlength: [200, 'Destination cannot be more than 200 characters']
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
    enum: ['Planning', 'Booked', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Planning'
  },
  budget: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    maxlength: [3, 'Currency code cannot be more than 3 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot be more than 2000 characters']
  },
  photos: [{
    url: {
      type: String,
      required: true
    },
    filename: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    caption: {
      type: String,
      maxlength: [200, 'Caption cannot be more than 200 characters']
    }
  }],
  itinerary: [{
    day: {
      type: Number,
      required: true,
      min: 1
    },
    date: Date,
    activities: [{
      time: String,
      activity: {
        type: String,
        required: true,
        maxlength: [300, 'Activity cannot be more than 300 characters']
      },
      location: String,
      cost: Number,
      notes: String
    }]
  }],
  accommodation: [{
    name: {
      type: String,
      required: true,
      maxlength: [200, 'Accommodation name cannot be more than 200 characters']
    },
    address: String,
    checkIn: Date,
    checkOut: Date,
    cost: Number,
    confirmationNumber: String,
    notes: String
  }],
  transportation: [{
    type: {
      type: String,
      enum: ['flight', 'train', 'bus', 'car', 'boat', 'other'],
      required: true
    },
    from: String,
    to: String,
    departureDate: Date,
    arrivalDate: Date,
    cost: Number,
    confirmationNumber: String,
    notes: String
  }],
  companions: [{
    name: {
      type: String,
      required: true,
      maxlength: [100, 'Companion name cannot be more than 100 characters']
    },
    email: String,
    phone: String,
    relationship: String
  }],
  totalCost: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
tripSchema.index({ user: 1, startDate: 1 });
tripSchema.index({ user: 1, status: 1 });
tripSchema.index({ user: 1, destination: 1 });

// Virtual for trip duration in days
tripSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  }
  return 0;
});

// Virtual for days until trip
tripSchema.virtual('daysUntil').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tripDate = new Date(this.startDate);
  tripDate.setHours(0, 0, 0, 0);
  
  const diffTime = tripDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for trip status color
tripSchema.virtual('statusColor').get(function() {
  const colors = {
    'Planning': '#6b7280',
    'Booked': '#3b82f6',
    'In Progress': '#f59e0b',
    'Completed': '#10b981',
    'Cancelled': '#ef4444'
  };
  return colors[this.status] || '#6b7280';
});

// Pre-save middleware to validate dates and calculate total cost
tripSchema.pre('save', function(next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    next(new Error('End date must be after start date'));
  }
  
  // Calculate total cost from accommodation and transportation
  let total = this.budget || 0;
  
  if (this.accommodation) {
    total += this.accommodation.reduce((sum, acc) => sum + (acc.cost || 0), 0);
  }
  
  if (this.transportation) {
    total += this.transportation.reduce((sum, trans) => sum + (trans.cost || 0), 0);
  }
  
  if (this.itinerary) {
    this.itinerary.forEach(day => {
      if (day.activities) {
        total += day.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
      }
    });
  }
  
  this.totalCost = total;
  
  next();
});

// Static method to get user's upcoming trips
tripSchema.statics.getUpcomingTrips = function(userId) {
  const today = new Date();
  return this.find({
    user: userId,
    startDate: { $gte: today },
    status: { $ne: 'Cancelled' }
  }).sort({ startDate: 1 });
};

// Static method to get trips by status
tripSchema.statics.getTripsByStatus = function(userId, status) {
  return this.find({
    user: userId,
    status: status
  }).sort({ startDate: -1 });
};

export default mongoose.model('Trip', tripSchema);