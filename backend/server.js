import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import compression from 'compression'
import morgan from 'morgan'
import session from 'express-session'
import passport from './config/passport.js'

// Import routes
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import taskRoutes from './routes/tasks.js'
import eventRoutes from './routes/events.js'
import timetableRoutes from './routes/timetable.js'
import tripRoutes from './routes/trips.js'
import birthdayRoutes from './routes/birthdays.js'
import noteRoutes from './routes/notes.js'
import reminderRoutes from './routes/reminders.js'

// Import middleware
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
	windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
	max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
	message: {
		error: 'Too many requests from this IP, please try again later.',
	},
})
app.use('/api/', limiter)

// Compression middleware
app.use(compression())

// Logging middleware
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'))
}

// CORS configuration
const corsOptions = {
	origin: process.env.CLIENT_URL || 'http://localhost:5173',
	credentials: true,
	optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Session configuration for Passport
app.use(
	session({
		secret: process.env.SESSION_SECRET || 'your-session-secret',
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: process.env.NODE_ENV === 'production',
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		},
	})
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Connect to MongoDB
const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGODB_URI)
		console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
	} catch (error) {
		console.error('❌ MongoDB connection error:', error.message)
		process.exit(1)
	}
}

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'DOOIT API is running!',
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV,
		features: {
			googleOAuth: !!(
				process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
			),
			emailService: !!process.env.EMAIL_USER,
			cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
		},
	})
})

// Favicon handler (prevent 404 errors)
app.get('/favicon.ico', (req, res) => res.status(204).end())

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/timetable', timetableRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/birthdays', birthdayRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/reminders', reminderRoutes)

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Start server
const startServer = async () => {
	await connectDB()

	app.listen(PORT, () => {
		console.log(
			`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
		)
		console.log(`📱 API Documentation: http://localhost:${PORT}/api/health`)
		console.log(
			`🔐 Google OAuth: ${
				process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
					? '✅ Configured'
					: '❌ Not configured'
			}`
		)
	})
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
	console.log(`❌ Unhandled Rejection: ${err.message}`)
	process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', err => {
	console.log(`❌ Uncaught Exception: ${err.message}`)
	process.exit(1)
})

startServer()

export default app
