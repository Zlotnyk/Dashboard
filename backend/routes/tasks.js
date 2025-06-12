import express from 'express';
import { 
  getTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask,
  getTodaysTasks,
  getActiveTasks,
  completeTask,
  getTaskStats
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validateTask, validate } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/tasks
// @desc    Get all user tasks
// @access  Private
router.get('/', getTasks);

// @route   GET /api/tasks/today
// @desc    Get today's tasks
// @access  Private
router.get('/today', getTodaysTasks);

// @route   GET /api/tasks/active
// @desc    Get active tasks
// @access  Private
router.get('/active', getActiveTasks);

// @route   GET /api/tasks/stats
// @desc    Get task statistics
// @access  Private
router.get('/stats', getTaskStats);

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', validateTask, validate, createTask);

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', getTask);

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', validateTask, validate, updateTask);

// @route   PUT /api/tasks/:id/complete
// @desc    Mark task as complete
// @access  Private
router.put('/:id/complete', completeTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', deleteTask);

export default router;