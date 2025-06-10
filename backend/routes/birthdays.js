import express from 'express';
import { 
  getBirthdays, 
  getBirthday, 
  createBirthday, 
  updateBirthday, 
  deleteBirthday,
  getUpcomingBirthdays,
  getBirthdaysByMonth
} from '../controllers/birthdayController.js';
import { protect } from '../middleware/auth.js';
import { validateBirthday, validate } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/birthdays
// @desc    Get all user birthdays
// @access  Private
router.get('/', getBirthdays);

// @route   GET /api/birthdays/upcoming
// @desc    Get upcoming birthdays
// @access  Private
router.get('/upcoming', getUpcomingBirthdays);

// @route   GET /api/birthdays/month/:month
// @desc    Get birthdays for specific month
// @access  Private
router.get('/month/:month', getBirthdaysByMonth);

// @route   POST /api/birthdays
// @desc    Create new birthday
// @access  Private
router.post('/', validateBirthday, validate, createBirthday);

// @route   GET /api/birthdays/:id
// @desc    Get single birthday
// @access  Private
router.get('/:id', getBirthday);

// @route   PUT /api/birthdays/:id
// @desc    Update birthday
// @access  Private
router.put('/:id', validateBirthday, validate, updateBirthday);

// @route   DELETE /api/birthdays/:id
// @desc    Delete birthday
// @access  Private
router.delete('/:id', deleteBirthday);

export default router;