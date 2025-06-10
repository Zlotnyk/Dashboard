import Task from '../models/Task.js';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = { user: req.user.id };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

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
    res.status(500).json({
      success: false,
      message: 'Server error getting tasks',
      error: error.message
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
    res.status(500).json({
      success: false,
      message: 'Server error getting task',
      error: error.message
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    req.body.user = req.user.id;

    const task = await Task.create(req.body);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating task',
      error: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
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

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating task',
      error: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
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

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting task',
      error: error.message
    });
  }
};

// @desc    Get today's tasks
// @route   GET /api/tasks/today
// @access  Private
export const getTodaysTasks = async (req, res) => {
  try {
    const tasks = await Task.getTodaysTasks(req.user.id);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting today\'s tasks',
      error: error.message
    });
  }
};

// @desc    Get active tasks
// @route   GET /api/tasks/active
// @access  Private
export const getActiveTasks = async (req, res) => {
  try {
    const tasks = await Task.getActiveTasks(req.user.id);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting active tasks',
      error: error.message
    });
  }
};

// @desc    Mark task as complete
// @route   PUT /api/tasks/:id/complete
// @access  Private
export const completeTask = async (req, res) => {
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

    task.isCompleted = !task.isCompleted;
    task.status = task.isCompleted ? 'Completed' : 'Not started';
    
    await task.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error completing task',
      error: error.message
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
          completed: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$endDate', new Date()] },
                    { $eq: ['$isCompleted', false] }
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

    const result = stats[0] || { total: 0, completed: 0, urgent: 0, overdue: 0 };
    result.completionRate = result.total > 0 ? Math.round((result.completed / result.total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting task stats',
      error: error.message
    });
  }
};