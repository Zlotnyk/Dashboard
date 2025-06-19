import Note from '../models/Note.js';

// @desc    Get all notes
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = { user: req.user.id, isArchived: false };
    if (category) query.category = category;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const notes = await Note.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Note.countDocuments(query);

    res.status(200).json({
      success: true,
      count: notes.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: notes
    });
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting notes',
      error: error.message
    });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
export const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error getting note:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting note',
      error: error.message
    });
  }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res) => {
  try {
    req.body.user = req.user.id;

    // Set date to today if not provided
    if (!req.body.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      req.body.date = today;
    }

    console.log('Creating note with data:', req.body);

    const note = await Note.create(req.body);

    console.log('Created note:', note);

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating note',
      error: error.message
    });
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res) => {
  try {
    let note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    console.log('Updating note:', req.params.id);
    console.log('Update data:', req.body);

    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    console.log('Updated note:', note);

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating note',
      error: error.message
    });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    console.log('Deleting note:', req.params.id);

    await Note.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting note',
      error: error.message
    });
  }
};

// @desc    Get today's notes
// @route   GET /api/notes/today
// @access  Private
export const getTodaysNotes = async (req, res) => {
  try {
    console.log('Getting today\'s notes for user:', req.user.id);
    
    const notes = await Note.getTodaysNotes(req.user.id);
    
    console.log('Found notes:', notes.length);

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    console.error('Error getting today\'s notes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting today\'s notes',
      error: error.message
    });
  }
};

// @desc    Get notes by category
// @route   GET /api/notes/category/:category
// @access  Private
export const getNotesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const notes = await Note.getNotesByCategory(req.user.id, category);

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    console.error('Error getting notes by category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting notes by category',
      error: error.message
    });
  }
};

// @desc    Search notes
// @route   GET /api/notes/search
// @access  Private
export const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const notes = await Note.searchNotes(req.user.id, q);

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    console.error('Error searching notes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching notes',
      error: error.message
    });
  }
};

// @desc    Get pinned notes
// @route   GET /api/notes/pinned
// @access  Private
export const getPinnedNotes = async (req, res) => {
  try {
    const notes = await Note.getPinnedNotes(req.user.id);

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    console.error('Error getting pinned notes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting pinned notes',
      error: error.message
    });
  }
};