import express from 'express';
import { 
  getNotes, 
  getNote, 
  createNote, 
  updateNote, 
  deleteNote,
  getTodaysNotes,
  getNotesByCategory,
  searchNotes,
  getPinnedNotes
} from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';
import { validateNote, validate } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/notes
// @desc    Get all user notes
// @access  Private
router.get('/', getNotes);

// @route   GET /api/notes/today
// @desc    Get today's notes
// @access  Private
router.get('/today', getTodaysNotes);

// @route   GET /api/notes/pinned
// @desc    Get pinned notes
// @access  Private
router.get('/pinned', getPinnedNotes);

// @route   GET /api/notes/category/:category
// @desc    Get notes by category
// @access  Private
router.get('/category/:category', getNotesByCategory);

// @route   GET /api/notes/search
// @desc    Search notes
// @access  Private
router.get('/search', searchNotes);

// @route   POST /api/notes
// @desc    Create new note
// @access  Private
router.post('/', validateNote, validate, createNote);

// @route   GET /api/notes/:id
// @desc    Get single note
// @access  Private
router.get('/:id', getNote);

// @route   PUT /api/notes/:id
// @desc    Update note
// @access  Private
router.put('/:id', validateNote, validate, updateNote);

// @route   DELETE /api/notes/:id
// @desc    Delete note
// @access  Private
router.delete('/:id', deleteNote);

export default router;