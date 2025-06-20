import Task from '../models/Task.js';

// @desc    Get all tasks for authenticated user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 100, status, priority, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = { user: req.user.id };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('Getting tasks for user:', req.user.id);
    console.log('Query:', query);

    const tasks = await Task.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    console.log('Found tasks:', tasks.length);
    console.log('Tasks data:', tasks);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: tasks
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    console.log('Creating task for user:', req.user.id);
    console.log('Task data:', req.body);

    // Add user to request body
    req.body.user = req.user.id;

    // Ensure required fields have defaults and proper date handling
    const taskData = {
      ...req.body,
      title: req.body.title || 'New Task',
      status: req.body.status || 'Not started',
      priority: req.body.priority || 'normal',
      description: req.body.description || '',
      // Ensure dates are properly formatted
      startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
      endDate: req.body.endDate ? new Date(req.body.endDate) : new Date()
    };

    // Log the dates for debugging
    console.log('Start date:', taskData.startDate);
    console.log('End date:', taskData.endDate);

    // Validate dates
    if (taskData.endDate < taskData.startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date'
      });
    }

    const task = await Task.create(taskData);

    console.log('Created task:', task);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return res.status(400).json({
        success: false,
        message: message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    console.log('Updating task:', req.params.id);
    console.log('Update data:', req.body);

    let task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Handle date updates
    const updateData = { ...req.body };
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
      console.log('Parsed startDate:', updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
      console.log('Parsed endDate:', updateData.endDate);
    }

    // Validate dates if both are provided
    if (updateData.startDate && updateData.endDate) {
      // Normalize dates to midnight UTC for comparison
      const startUTC = Date.UTC(
        updateData.startDate.getFullYear(), 
        updateData.startDate.getMonth(), 
        updateData.startDate.getDate()
      );
      
      const endUTC = Date.UTC(
        updateData.endDate.getFullYear(), 
        updateData.endDate.getMonth(), 
        updateData.endDate.getDate()
      );
      
      if (endUTC < startUTC) {
        return res.status(400).json({
          success: false,
          message: 'End date must be on or after the start date'
        });
      }
    }

    // Log the final update data before sending to database
    console.log('Final update data:', updateData);

    task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    console.log('Updated task:', task);

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return res.status(400).json({
        success: false,
        message: message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    console.log('Deleting task:', req.params.id);

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    console.log('Deleted task successfully');

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get today's tasks
// @route   GET /api/tasks/today
// @access  Private
export const getTodaysTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await Task.find({
      user: req.user.id,
      $or: [
        { startDate: { $lte: today }, endDate: { $gte: today } },
        { startDate: { $gte: today, $lt: tomorrow } }
      ]
    }).sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error getting today\'s tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get active tasks (tasks that are currently in progress)
// @route   GET /api/tasks/active
// @access  Private
export const getActiveTasks = async (req, res) => {
  try {
    const today = new Date();
    
    const tasks = await Task.find({
      user: req.user.id,
      startDate: { $lte: today },
      endDate: { $gte: today },
      status: { $ne: 'Completed' }
    }).sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error getting active tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Mark task as completed
// @route   PUT /api/tasks/:id/complete
// @access  Private
export const completeTask = async (req, res) => {
  try {
    let task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Completed',
        completedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
export const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await Task.aggregate([
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
          urgent: {
            $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      urgent: 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting task stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};