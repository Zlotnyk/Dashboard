import express from 'express';
import { 
  getTimetable, 
  getTimetableEntry, 
  createTimetableEntry, 
  updateTimetableEntry, 
  deleteTimetableEntry,
  getDayTimetable,
  checkTimeConflict
} from '../controllers/timetableController.js';
import { protect } from '../middleware/auth.js';
import { validateTimetable, validate } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/timetable
// @desc    Get user's complete timetable
// @access  Private
router.get('/', getTimetable);

// @route   GET /api/timetable/day/:weekDay
// @desc    Get timetable for specific day
// @access  Private
router.get('/day/:weekDay', getDayTimetable);

// @route   POST /api/timetable/check-conflict
// @desc    Check for time conflicts
// @access  Private
router.post('/check-conflict', checkTimeConflict);

// @route   POST /api/timetable
// @desc    Create new timetable entry
// @access  Private
router.post('/', validateTimetable, validate, createTimetableEntry);

// @route   GET /api/timetable/:id
// @desc    Get single timetable entry
// @access  Private
router.get('/:id', getTimetableEntry);

// @route   PUT /api/timetable/:id
// @desc    Update timetable entry
// @access  Private
router.put('/:id', validateTimetable, validate, updateTimetableEntry);

// @route   DELETE /api/timetable/:id
// @desc    Delete timetable entry
// @access  Private
router.delete('/:id', deleteTimetableEntry);

export default router;