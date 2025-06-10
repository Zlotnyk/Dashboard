import express from 'express';
import { 
  getEvents, 
  getEvent, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  getUpcomingEvents,
  getEventsByCategory,
  getEventsForMonth
} from '../controllers/eventController.js';
import { protect } from '../middleware/auth.js';
import { validateEvent, validate } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/events
// @desc    Get all user events
// @access  Private
router.get('/', getEvents);

// @route   GET /api/events/upcoming
// @desc    Get upcoming events
// @access  Private
router.get('/upcoming', getUpcomingEvents);

// @route   GET /api/events/category/:category
// @desc    Get events by category
// @access  Private
router.get('/category/:category', getEventsByCategory);

// @route   GET /api/events/month/:year/:month
// @desc    Get events for specific month
// @access  Private
router.get('/month/:year/:month', getEventsForMonth);

// @route   POST /api/events
// @desc    Create new event
// @access  Private
router.post('/', validateEvent, validate, createEvent);

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Private
router.get('/:id', getEvent);

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private
router.put('/:id', validateEvent, validate, updateEvent);

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private
router.delete('/:id', deleteEvent);

export default router;