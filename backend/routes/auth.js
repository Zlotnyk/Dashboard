import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, getMe, updateProfile, changePassword, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRegister, validateLogin, validate } from '../middleware/validation.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', validateRegister, validate, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, validate, login);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logout);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email')
], validate, updateProfile);

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', protect, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], validate, changePassword);

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email')
], validate, forgotPassword);

// @route   PUT /api/auth/reset-password/:resettoken
// @desc    Reset password
// @access  Public
router.put('/reset-password/:resettoken', [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], validate, resetPassword);

export default router;