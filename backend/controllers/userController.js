import User from '../models/User.js';
import Task from '../models/Task.js';
import Event from '../models/Event.js';
import Trip from '../models/Trip.js';
import Note from '../models/Note.js';
import Reminder from '../models/Reminder.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get user preferences
// @route   GET /api/users/preferences
// @access  Private
export const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user.preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting preferences',
      error: error.message
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
export const updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Update preferences
    if (req.body.theme) {
      user.preferences.theme = { ...user.preferences.theme, ...req.body.theme };
    }
    if (req.body.language) {
      user.preferences.language = req.body.language;
    }
    if (req.body.notifications) {
      user.preferences.notifications = { ...user.preferences.notifications, ...req.body.notifications };
    }
    if (req.body.timezone) {
      user.preferences.timezone = req.body.timezone;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating preferences',
      error: error.message
    });
  }
};

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
  try {
    // Check if file exists
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }

    const avatar = req.files.avatar;

    // Make sure the image is a photo
    if (!avatar.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Check file size (max 5MB)
    if (avatar.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Image must be less than 5MB'
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create custom filename
    const fileName = `avatar_${req.user.id}${path.extname(avatar.name)}`;

    // Move file to uploads folder
    avatar.mv(path.join(uploadsDir, fileName), async err => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: 'Problem with file upload'
        });
      }

      // Update user avatar in database
      const avatarUrl = `/uploads/${fileName}`;
      
      // Find and update the user
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Delete old avatar file if it exists
      if (user.avatar && user.avatar.startsWith('/uploads/')) {
        const oldAvatarPath = path.join(__dirname, '..', 'public', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          try {
            fs.unlinkSync(oldAvatarPath);
          } catch (error) {
            console.error('Error deleting old avatar:', error);
          }
        }
      }
      
      // Update user with new avatar
      user.avatar = avatarUrl;
      await user.save();

      res.status(200).json({
        success: true,
        avatarUrl
      });
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading avatar',
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get counts for different data types
    const [
      totalTasks,
      completedTasks,
      activeTasks,
      totalEvents,
      totalTrips,
      totalNotes,
      totalReminders,
      urgentReminders
    ] = await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, isCompleted: true }),
      Task.countDocuments({ user: userId, isCompleted: false }),
      Event.countDocuments({ user: userId }),
      Trip.countDocuments({ user: userId }),
      Note.countDocuments({ user: userId, isArchived: false }),
      Reminder.countDocuments({ user: userId }),
      Reminder.countDocuments({ 
        user: userId, 
        dueDate: { $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        isCompleted: false 
      })
    ]);

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Get recent activity (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await Promise.all([
      Task.countDocuments({ user: userId, createdAt: { $gte: weekAgo } }),
      Event.countDocuments({ user: userId, createdAt: { $gte: weekAgo } }),
      Note.countDocuments({ user: userId, createdAt: { $gte: weekAgo } })
    ]);

    const stats = {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        active: activeTasks,
        completionRate
      },
      events: {
        total: totalEvents
      },
      trips: {
        total: totalTrips
      },
      notes: {
        total: totalNotes
      },
      reminders: {
        total: totalReminders,
        urgent: urgentReminders
      },
      recentActivity: {
        tasks: recentActivity[0],
        events: recentActivity[1],
        notes: recentActivity[2]
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting user stats',
      error: error.message
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all user data
    await Promise.all([
      Task.deleteMany({ user: userId }),
      Event.deleteMany({ user: userId }),
      Trip.deleteMany({ user: userId }),
      Note.deleteMany({ user: userId }),
      Reminder.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting account',
      error: error.message
    });
  }
};