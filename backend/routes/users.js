import express from 'express';
import { body } from 'express-validator';
import { 
  updatePreferences, 
  getPreferences, 
  uploadAvatar, 
  deleteAccount,
  getUserStats 
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/users/preferences
// @desc    Get user preferences
// @access  Private
router.get('/preferences', getPreferences);

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', [
  body('theme.accentColor')
    .optional()
    .isHexColor()
    .withMessage('Please enter a valid hex color'),
  body('theme.backgroundGif')
    .optional()
    .isString()
    .withMessage('Background GIF must be a string'),
  body('language')
    .optional()
    .isIn(['English', 'Ukrainian'])
    .withMessage('Invalid language'),
  body('notifications.examReminders')
    .optional()
    .isBoolean()
    .withMessage('Exam reminders must be a boolean'),
  body('notifications.assignmentReminders')
    .optional()
    .isBoolean()
    .withMessage('Assignment reminders must be a boolean'),
  body('notifications.birthdayReminders')
    .optional()
    .isBoolean()
    .withMessage('Birthday reminders must be a boolean')
], validate, updatePreferences);

// @route   POST /api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', uploadAvatar);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', getUserStats);

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', deleteAccount);

export default router;