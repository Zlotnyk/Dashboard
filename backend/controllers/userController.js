import User from '../models/User.js';
import Task from '../models/Task.js';
import Event from '../models/Event.js';
import Trip from '../models/Trip.js';
import Note from '../models/Note.js';
import Reminder from '../models/Reminder.js';

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
    // Here you would implement file upload logic
    // For now, just return success
    res.status(200).json({
      success: true,
      message: 'Avatar upload functionality to be implemented'
    });
  } catch (error) {
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