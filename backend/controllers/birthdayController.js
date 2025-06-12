import Birthday from '../models/Birthday.js';

// @desc    Get all birthdays
// @route   GET /api/birthdays
// @access  Private
export const getBirthdays = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'birthDate', sortOrder = 'asc' } = req.query;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const birthdays = await Birthday.find({ user: req.user.id })
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Birthday.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: birthdays.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: birthdays
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting birthdays',
      error: error.message
    });
  }
};

// @desc    Get single birthday
// @route   GET /api/birthdays/:id
// @access  Private
export const getBirthday = async (req, res) => {
  try {
    const birthday = await Birthday.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!birthday) {
      return res.status(404).json({
        success: false,
        message: 'Birthday not found'
      });
    }

    res.status(200).json({
      success: true,
      data: birthday
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting birthday',
      error: error.message
    });
  }
};

// @desc    Create new birthday
// @route   POST /api/birthdays
// @access  Private
export const createBirthday = async (req, res) => {
  try {
    req.body.user = req.user.id;

    const birthday = await Birthday.create(req.body);

    res.status(201).json({
      success: true,
      data: birthday
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating birthday',
      error: error.message
    });
  }
};

// @desc    Update birthday
// @route   PUT /api/birthdays/:id
// @access  Private
export const updateBirthday = async (req, res) => {
  try {
    let birthday = await Birthday.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!birthday) {
      return res.status(404).json({
        success: false,
        message: 'Birthday not found'
      });
    }

    birthday = await Birthday.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: birthday
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating birthday',
      error: error.message
    });
  }
};

// @desc    Delete birthday
// @route   DELETE /api/birthdays/:id
// @access  Private
export const deleteBirthday = async (req, res) => {
  try {
    const birthday = await Birthday.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!birthday) {
      return res.status(404).json({
        success: false,
        message: 'Birthday not found'
      });
    }

    await Birthday.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Birthday deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting birthday',
      error: error.message
    });
  }
};

// @desc    Get upcoming birthdays
// @route   GET /api/birthdays/upcoming
// @access  Private
export const getUpcomingBirthdays = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const birthdays = await Birthday.getUpcomingBirthdays(req.user.id, parseInt(days));

    res.status(200).json({
      success: true,
      count: birthdays.length,
      data: birthdays
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting upcoming birthdays',
      error: error.message
    });
  }
};

// @desc    Get birthdays by month
// @route   GET /api/birthdays/month/:month
// @access  Private
export const getBirthdaysByMonth = async (req, res) => {
  try {
    const month = parseInt(req.params.month);
    
    if (month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month. Must be between 1 and 12'
      });
    }

    const birthdays = await Birthday.getBirthdaysByMonth(req.user.id, month);

    res.status(200).json({
      success: true,
      count: birthdays.length,
      data: birthdays
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting birthdays by month',
      error: error.message
    });
  }
};