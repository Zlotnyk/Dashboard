import Reminder from '../models/Reminder.js';

// @desc    Get all reminders
// @route   GET /api/reminders
// @access  Private
export const getReminders = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, priority, sortBy = 'dueDate', sortOrder = 'asc' } = req.query;

    // Build query
    const query = { user: req.user.id };
    if (type) query.type = type;
    if (priority) query.priority = priority;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reminders = await Reminder.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Reminder.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reminders.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting reminders',
      error: error.message
    });
  }
};

// @desc    Get single reminder
// @route   GET /api/reminders/:id
// @access  Private
export const getReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting reminder',
      error: error.message
    });
  }
};

// @desc    Create new reminder
// @route   POST /api/reminders
// @access  Private
export const createReminder = async (req, res) => {
  try {
    req.body.user = req.user.id;

    const reminder = await Reminder.create(req.body);

    res.status(201).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating reminder',
      error: error.message
    });
  }
};

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private
export const updateReminder = async (req, res) => {
  try {
    let reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating reminder',
      error: error.message
    });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    await Reminder.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting reminder',
      error: error.message
    });
  }
};

// @desc    Get urgent reminders
// @route   GET /api/reminders/urgent
// @access  Private
export const getUrgentReminders = async (req, res) => {
  try {
    const reminders = await Reminder.getUrgentReminders(req.user.id);

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting urgent reminders',
      error: error.message
    });
  }
};

// @desc    Get reminders by type
// @route   GET /api/reminders/type/:type
// @access  Private
export const getRemindersByType = async (req, res) => {
  try {
    const { type } = req.params;
    const reminders = await Reminder.getRemindersByType(req.user.id, type);

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting reminders by type',
      error: error.message
    });
  }
};

// @desc    Get upcoming reminders
// @route   GET /api/reminders/upcoming
// @access  Private
export const getUpcomingReminders = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const reminders = await Reminder.getUpcomingReminders(req.user.id, parseInt(days));

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting upcoming reminders',
      error: error.message
    });
  }
};

// @desc    Mark reminder as complete
// @route   PUT /api/reminders/:id/complete
// @access  Private
export const completeReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    reminder.isCompleted = !reminder.isCompleted;
    reminder.status = reminder.isCompleted ? 'Completed' : 'Not started';
    
    await reminder.save();

    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error completing reminder',
      error: error.message
    });
  }
};