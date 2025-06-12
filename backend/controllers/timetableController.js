import Timetable from '../models/Timetable.js';

// @desc    Get user's complete timetable
// @route   GET /api/timetable
// @access  Private
export const getTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.getUserTimetable(req.user.id);

    res.status(200).json({
      success: true,
      count: timetable.length,
      data: timetable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting timetable',
      error: error.message
    });
  }
};

// @desc    Get single timetable entry
// @route   GET /api/timetable/:id
// @access  Private
export const getTimetableEntry = async (req, res) => {
  try {
    const entry = await Timetable.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting timetable entry',
      error: error.message
    });
  }
};

// @desc    Create new timetable entry
// @route   POST /api/timetable
// @access  Private
export const createTimetableEntry = async (req, res) => {
  try {
    req.body.user = req.user.id;

    // Check for time conflicts
    const conflict = await Timetable.checkTimeConflict(
      req.user.id,
      req.body.weekDay,
      req.body.startTime,
      req.body.endTime
    );

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'Time conflict with existing timetable entry',
        conflictWith: conflict
      });
    }

    const entry = await Timetable.create(req.body);

    res.status(201).json({
      success: true,
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating timetable entry',
      error: error.message
    });
  }
};

// @desc    Update timetable entry
// @route   PUT /api/timetable/:id
// @access  Private
export const updateTimetableEntry = async (req, res) => {
  try {
    let entry = await Timetable.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found'
      });
    }

    // Check for time conflicts (excluding current entry)
    if (req.body.weekDay || req.body.startTime || req.body.endTime) {
      const conflict = await Timetable.checkTimeConflict(
        req.user.id,
        req.body.weekDay || entry.weekDay,
        req.body.startTime || entry.startTime,
        req.body.endTime || entry.endTime,
        req.params.id
      );

      if (conflict) {
        return res.status(400).json({
          success: false,
          message: 'Time conflict with existing timetable entry',
          conflictWith: conflict
        });
      }
    }

    entry = await Timetable.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating timetable entry',
      error: error.message
    });
  }
};

// @desc    Delete timetable entry
// @route   DELETE /api/timetable/:id
// @access  Private
export const deleteTimetableEntry = async (req, res) => {
  try {
    const entry = await Timetable.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found'
      });
    }

    await Timetable.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Timetable entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting timetable entry',
      error: error.message
    });
  }
};

// @desc    Get timetable for specific day
// @route   GET /api/timetable/day/:weekDay
// @access  Private
export const getDayTimetable = async (req, res) => {
  try {
    const { weekDay } = req.params;
    const timetable = await Timetable.getDayTimetable(req.user.id, weekDay);

    res.status(200).json({
      success: true,
      count: timetable.length,
      data: timetable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting day timetable',
      error: error.message
    });
  }
};

// @desc    Check for time conflicts
// @route   POST /api/timetable/check-conflict
// @access  Private
export const checkTimeConflict = async (req, res) => {
  try {
    const { weekDay, startTime, endTime, excludeId } = req.body;

    const conflict = await Timetable.checkTimeConflict(
      req.user.id,
      weekDay,
      startTime,
      endTime,
      excludeId
    );

    res.status(200).json({
      success: true,
      hasConflict: !!conflict,
      conflict: conflict || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error checking time conflict',
      error: error.message
    });
  }
};