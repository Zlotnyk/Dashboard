import Trip from '../models/Trip.js';

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
export const getTrips = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'startDate', sortOrder = 'asc' } = req.query;

    // Build query
    const query = { user: req.user.id };
    if (status) query.status = status;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const trips = await Trip.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trip.countDocuments(query);

    res.status(200).json({
      success: true,
      count: trips.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: trips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting trips',
      error: error.message
    });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
export const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting trip',
      error: error.message
    });
  }
};

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private
export const createTrip = async (req, res) => {
  try {
    req.body.user = req.user.id;

    const trip = await Trip.create(req.body);

    res.status(201).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating trip',
      error: error.message
    });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
export const updateTrip = async (req, res) => {
  try {
    let trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating trip',
      error: error.message
    });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    await Trip.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting trip',
      error: error.message
    });
  }
};

// @desc    Get upcoming trips
// @route   GET /api/trips/upcoming
// @access  Private
export const getUpcomingTrips = async (req, res) => {
  try {
    const trips = await Trip.getUpcomingTrips(req.user.id);

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting upcoming trips',
      error: error.message
    });
  }
};

// @desc    Get trips by status
// @route   GET /api/trips/status/:status
// @access  Private
export const getTripsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const trips = await Trip.getTripsByStatus(req.user.id, status);

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting trips by status',
      error: error.message
    });
  }
};

// @desc    Upload trip photos
// @route   POST /api/trips/:id/photos
// @access  Private
export const uploadTripPhotos = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Here you would implement file upload logic
    // For now, just return success
    res.status(200).json({
      success: true,
      message: 'Photo upload functionality to be implemented'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error uploading photos',
      error: error.message
    });
  }
};