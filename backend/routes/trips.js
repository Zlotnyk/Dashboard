import express from 'express';
import { 
  getTrips, 
  getTrip, 
  createTrip, 
  updateTrip, 
  deleteTrip,
  getUpcomingTrips,
  getTripsByStatus,
  uploadTripPhotos
} from '../controllers/tripController.js';
import { protect } from '../middleware/auth.js';
import { validateTrip, validate } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/trips
// @desc    Get all user trips
// @access  Private
router.get('/', getTrips);

// @route   GET /api/trips/upcoming
// @desc    Get upcoming trips
// @access  Private
router.get('/upcoming', getUpcomingTrips);

// @route   GET /api/trips/status/:status
// @desc    Get trips by status
// @access  Private
router.get('/status/:status', getTripsByStatus);

// @route   POST /api/trips
// @desc    Create new trip
// @access  Private
router.post('/', validateTrip, validate, createTrip);

// @route   GET /api/trips/:id
// @desc    Get single trip
// @access  Private
router.get('/:id', getTrip);

// @route   PUT /api/trips/:id
// @desc    Update trip
// @access  Private
router.put('/:id', validateTrip, validate, updateTrip);

// @route   POST /api/trips/:id/photos
// @desc    Upload trip photos
// @access  Private
router.post('/:id/photos', uploadTripPhotos);

// @route   DELETE /api/trips/:id
// @desc    Delete trip
// @access  Private
router.delete('/:id', deleteTrip);

export default router;