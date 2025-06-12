import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    theme: {
      accentColor: {
        type: String,
        default: '#97e7aa'
      },
      backgroundGif: {
        type: String,
        default: 'Green.gif'
      }
    },
    language: {
      type: String,
      default: 'English',
      enum: ['English', 'Ukrainian']
    },
    notifications: {
      examReminders: {
        type: Boolean,
        default: true
      },
      assignmentReminders: {
        type: Boolean,
        default: true
      },
      birthdayReminders: {
        type: Boolean,
        default: true
      }
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Remove duplicate indexes - only keep one definition per field
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    preferences: this.preferences,
    isEmailVerified: this.isEmailVerified,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    isGoogleUser: !!this.googleId
  };
});

// Hash password before saving (only for non-Google users)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.googleId) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method (skip for Google users)
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.googleId) {
    return false; // Google users can't login with password
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

export default mongoose.model('User', userSchema);