import mongoose from 'mongoose';

const birthdaySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  birthDate: {
    type: Date,
    required: [true, 'Birth date is required']
  },
  relationship: {
    type: String,
    trim: true,
    maxlength: [50, 'Relationship cannot be more than 50 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone cannot be more than 20 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  avatar: {
    type: String
  },
  reminderDays: [{
    type: Number,
    min: 0,
    max: 365
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  giftIdeas: [{
    idea: {
      type: String,
      required: true,
      maxlength: [200, 'Gift idea cannot be more than 200 characters']
    },
    price: Number,
    url: String,
    isPurchased: {
      type: Boolean,
      default: false
    },
    notes: String
  }],
  lastCelebrated: Date,
  celebrationHistory: [{
    year: {
      type: Number,
      required: true
    },
    age: Number,
    celebration: String,
    photos: [String],
    notes: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
birthdaySchema.index({ user: 1, birthDate: 1 });
birthdaySchema.index({ user: 1, isActive: 1 });

// Virtual for current age
birthdaySchema.virtual('currentAge').get(function() {
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual for next birthday
birthdaySchema.virtual('nextBirthday').get(function() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const birthDate = new Date(this.birthDate);
  
  let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
  
  if (nextBirthday < today) {
    nextBirthday.setFullYear(currentYear + 1);
  }
  
  return nextBirthday;
});

// Virtual for days until next birthday
birthdaySchema.virtual('daysUntilBirthday').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextBirthday = this.nextBirthday;
  nextBirthday.setHours(0, 0, 0, 0);
  
  const diffTime = nextBirthday - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for next age
birthdaySchema.virtual('nextAge').get(function() {
  const nextBirthday = this.nextBirthday;
  const birthDate = new Date(this.birthDate);
  return nextBirthday.getFullYear() - birthDate.getFullYear();
});

// Virtual for zodiac sign
birthdaySchema.virtual('zodiacSign').get(function() {
  const month = this.birthDate.getMonth() + 1;
  const day = this.birthDate.getDate();
  
  const signs = [
    { sign: 'Capricorn', start: [12, 22], end: [1, 19] },
    { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
    { sign: 'Pisces', start: [2, 19], end: [3, 20] },
    { sign: 'Aries', start: [3, 21], end: [4, 19] },
    { sign: 'Taurus', start: [4, 20], end: [5, 20] },
    { sign: 'Gemini', start: [5, 21], end: [6, 20] },
    { sign: 'Cancer', start: [6, 21], end: [7, 22] },
    { sign: 'Leo', start: [7, 23], end: [8, 22] },
    { sign: 'Virgo', start: [8, 23], end: [9, 22] },
    { sign: 'Libra', start: [9, 23], end: [10, 22] },
    { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
    { sign: 'Sagittarius', start: [11, 22], end: [12, 21] }
  ];
  
  for (const { sign, start, end } of signs) {
    if (
      (month === start[0] && day >= start[1]) ||
      (month === end[0] && day <= end[1])
    ) {
      return sign;
    }
  }
  
  return 'Capricorn'; // Default fallback
});

// Static method to get upcoming birthdays
birthdaySchema.statics.getUpcomingBirthdays = function(userId, days = 30) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), isActive: true } },
    {
      $addFields: {
        nextBirthday: {
          $dateFromParts: {
            year: { $year: new Date() },
            month: { $month: '$birthDate' },
            day: { $dayOfMonth: '$birthDate' }
          }
        }
      }
    },
    {
      $addFields: {
        nextBirthday: {
          $cond: {
            if: { $lt: ['$nextBirthday', new Date()] },
            then: {
              $dateFromParts: {
                year: { $add: [{ $year: new Date() }, 1] },
                month: { $month: '$birthDate' },
                day: { $dayOfMonth: '$birthDate' }
              }
            },
            else: '$nextBirthday'
          }
        }
      }
    },
    {
      $addFields: {
        daysUntil: {
          $divide: [
            { $subtract: ['$nextBirthday', new Date()] },
            1000 * 60 * 60 * 24
          ]
        }
      }
    },
    { $match: { daysUntil: { $lte: days } } },
    { $sort: { daysUntil: 1 } }
  ]);
};

// Static method to get birthdays by month
birthdaySchema.statics.getBirthdaysByMonth = function(userId, month) {
  return this.find({
    user: userId,
    isActive: true,
    $expr: { $eq: [{ $month: '$birthDate' }, month] }
  }).sort({ birthDate: 1 });
};

export default mongoose.model('Birthday', birthdaySchema);