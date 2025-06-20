import { body, validationResult } from 'express-validator';
import { validateDateRange } from '../utils/dateUtils.js';

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Task validation rules
export const validateTask = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Please enter a valid start date'),
  body('endDate')
    .isISO8601()
    .withMessage('Please enter a valid end date')
    .custom((value, { req }) => {
      // Parse dates for validation
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      
      // Validate using our utility function
      if (!validateDateRange(startDate, endDate)) {
        throw new Error('End date must be on or after the start date');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['Not started', 'In progress', 'Completed', 'On hold'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority')
];

// Event validation rules
export const validateEvent = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please enter a valid date'),
  body('category')
    .optional()
    .isIn(['meeting', 'birthday', 'event', 'other'])
    .withMessage('Invalid category'),
  body('time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please enter a valid time format (HH:MM)')
];

// Timetable validation rules
export const validateTimetable = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('weekDay')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid week day'),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please enter a valid start time format (HH:MM)'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please enter a valid end time format (HH:MM)')
    .custom((value, { req }) => {
      const [startHour, startMin] = req.body.startTime.split(':').map(Number);
      const [endHour, endMin] = value.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (startMinutes >= endMinutes) {
        throw new Error('End time must be after start time');
      }
      return true;
    })
];

// Trip validation rules
export const validateTrip = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('destination')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Destination must be between 1 and 200 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Please enter a valid start date'),
  body('endDate')
    .isISO8601()
    .withMessage('Please enter a valid end date')
    .custom((value, { req }) => {
      // Parse dates for validation
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      
      // Validate using our utility function
      if (!validateDateRange(startDate, endDate)) {
        throw new Error('End date must be on or after the start date');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['Planning', 'Booked', 'In Progress', 'Completed', 'Cancelled'])
    .withMessage('Invalid status'),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number')
];

// Birthday validation rules
export const validateBirthday = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('birthDate')
    .isISO8601()
    .withMessage('Please enter a valid birth date')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      if (birthDate > today) {
        throw new Error('Birth date cannot be in the future');
      }
      return true;
    }),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email')
];

// Note validation rules
export const validateNote = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['daily', 'study', 'personal', 'work', 'ideas', 'other'])
    .withMessage('Invalid category')
];

// Reminder validation rules
export const validateReminder = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('type')
    .isIn(['exam', 'assignment', 'general'])
    .withMessage('Invalid reminder type'),
  body('dueDate')
    .isISO8601()
    .withMessage('Please enter a valid due date'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority')
];