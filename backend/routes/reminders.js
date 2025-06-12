import express from 'express';
import { 
  getReminders, 
  getReminder, 
  createReminder, 
  updateReminder, 
  deleteReminder,
  getUrgentReminders,
  getRemindersByType,
  getUpcomingReminders,
  completeReminder
} from '../controllers/reminderController.js';
import { protect } from '../middleware/auth.js';
import { validateReminder, validate } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/reminders
// @desc    Get all user reminders
// @access  Private
router.get('/', getReminders);

// @route   GET /api/reminders/urgent
// @desc    Get urgent reminders
// @access  Private
router.get('/urgent', getUrgentReminders);

// @route   GET /api/reminders/upcoming
// @desc    Get upcoming reminders
// @access  Private
router.get('/upcoming', getUpcomingReminders);

// @route   GET /api/reminders/type/:type
// @desc    Get reminders by type
// @access  Private
router.get('/type/:type', getRemindersByType);

// @route   POST /api/reminders
// @desc    Create new reminder
// @access  Private
router.post('/', validateReminder, validate, createReminder);

// @route   GET /api/reminders/:id
// @desc    Get single reminder
// @access  Private
router.get('/:id', getReminder);

// @route   PUT /api/reminders/:id
// @desc    Update reminder
// @access  Private
router.put('/:id', validateReminder, validate, updateReminder);

// @route   PUT /api/reminders/:id/complete
// @desc    Mark reminder as complete
// @access  Private
router.put('/:id/complete', completeReminder);

// @route   DELETE /api/reminders/:id
// @desc    Delete reminder
// @access  Private
router.delete('/:id', deleteReminder);

export default router;