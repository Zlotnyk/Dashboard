import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true,
    maxlength: [2000, 'Note content cannot be more than 2000 characters']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    enum: ['daily', 'study', 'personal', 'work', 'ideas', 'other'],
    default: 'daily'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  color: {
    type: String,
    default: '#fbbf24'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reminders: [{
    date: {
      type: Date,
      required: true
    },
    message: String,
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
  linkedTo: {
    type: {
      type: String,
      enum: ['task', 'event', 'trip']
    },
    id: mongoose.Schema.Types.ObjectId
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
noteSchema.index({ user: 1, date: -1 });
noteSchema.index({ user: 1, category: 1 });
noteSchema.index({ user: 1, isPinned: 1 });
noteSchema.index({ user: 1, isArchived: 1 });
noteSchema.index({ user: 1, tags: 1 });

// Virtual for word count
noteSchema.virtual('wordCount').get(function() {
  if (this.content) {
    return this.content.trim().split(/\s+/).length;
  }
  return 0;
});

// Virtual for character count
noteSchema.virtual('characterCount').get(function() {
  return this.content ? this.content.length : 0;
});

// Virtual for reading time (assuming 200 words per minute)
noteSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const words = this.wordCount;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
});

// Static method to get today's notes
noteSchema.statics.getTodaysNotes = function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    user: userId,
    date: { $gte: today, $lt: tomorrow },
    isArchived: false
  }).sort({ isPinned: -1, createdAt: -1 });
};

// Static method to get notes by category
noteSchema.statics.getNotesByCategory = function(userId, category) {
  return this.find({
    user: userId,
    category: category,
    isArchived: false
  }).sort({ isPinned: -1, createdAt: -1 });
};

// Static method to search notes
noteSchema.statics.searchNotes = function(userId, query) {
  return this.find({
    user: userId,
    isArchived: false,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  }).sort({ isPinned: -1, createdAt: -1 });
};

// Static method to get pinned notes
noteSchema.statics.getPinnedNotes = function(userId) {
  return this.find({
    user: userId,
    isPinned: true,
    isArchived: false
  }).sort({ createdAt: -1 });
};

export default mongoose.model('Note', noteSchema);