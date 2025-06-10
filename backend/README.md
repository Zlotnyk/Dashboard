# DOOIT Backend API

Backend API for DOOIT Student Planner & Lifestyle Dashboard built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with bcrypt password hashing
- **User Management**: Profile management, preferences, and statistics
- **Task Management**: CRUD operations for tasks with priority and status tracking
- **Event Management**: Calendar events with categories and recurring support
- **Timetable Management**: Class schedule management with conflict detection
- **Trip Planning**: Travel planning with itineraries, photos, and budget tracking
- **Birthday Tracking**: Birthday management with age calculation and reminders
- **Notes System**: Note-taking with categories, tags, and search functionality
- **Reminder System**: Exam and assignment reminders with notifications
- **Data Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Centralized error handling with detailed responses
- **Security**: Rate limiting, CORS, helmet, and input sanitization
- **Performance**: Compression, caching, and optimized database queries

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dooit-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/dooit
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:5173
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Start the server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Task Endpoints

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer <token>
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the DOOIT project",
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-01-20T00:00:00.000Z",
  "priority": "urgent",
  "status": "In progress"
}
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated task title",
  "status": "Completed"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

### Event Endpoints

#### Get All Events
```http
GET /api/events
Authorization: Bearer <token>
```

#### Create Event
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Team Meeting",
  "date": "2025-01-15T00:00:00.000Z",
  "time": "14:30",
  "location": "Conference Room A",
  "category": "meeting"
}
```

### Timetable Endpoints

#### Get Timetable
```http
GET /api/timetable
Authorization: Bearer <token>
```

#### Create Timetable Entry
```http
POST /api/timetable
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Mathematics",
  "weekDay": "Monday",
  "startTime": "09:00",
  "endTime": "10:30",
  "classroom": "Room 101",
  "professor": "Dr. Smith"
}
```

### Trip Endpoints

#### Get All Trips
```http
GET /api/trips
Authorization: Bearer <token>
```

#### Create Trip
```http
POST /api/trips
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Summer Vacation",
  "destination": "Paris, France",
  "startDate": "2025-07-01T00:00:00.000Z",
  "endDate": "2025-07-10T00:00:00.000Z",
  "budget": 2000,
  "status": "Planning"
}
```

### Birthday Endpoints

#### Get All Birthdays
```http
GET /api/birthdays
Authorization: Bearer <token>
```

#### Create Birthday
```http
POST /api/birthdays
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Alice Johnson",
  "birthDate": "1995-03-15T00:00:00.000Z",
  "relationship": "Friend",
  "email": "alice@example.com"
}
```

### Note Endpoints

#### Get All Notes
```http
GET /api/notes
Authorization: Bearer <token>
```

#### Create Note
```http
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Remember to buy groceries",
  "category": "personal",
  "tags": ["shopping", "reminder"]
}
```

### Reminder Endpoints

#### Get All Reminders
```http
GET /api/reminders
Authorization: Bearer <token>
```

#### Create Reminder
```http
POST /api/reminders
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Math Exam",
  "type": "exam",
  "dueDate": "2025-01-20T00:00:00.000Z",
  "subject": "Mathematics",
  "priority": "high"
}
```

## 🗄️ Database Schema

### User Model
- Personal information (name, email, password)
- Preferences (theme, language, notifications)
- Authentication tokens and verification status

### Task Model
- Task details (title, description, dates)
- Status and priority tracking
- Progress monitoring and completion status

### Event Model
- Event information (title, date, time, location)
- Category-based organization
- Birthday-specific fields and recurring events

### Timetable Model
- Class schedule information
- Time conflict detection
- Professor and classroom details

### Trip Model
- Travel planning details
- Itinerary and accommodation tracking
- Photo uploads and budget management

### Birthday Model
- Personal information and relationships
- Age calculation and next birthday tracking
- Gift ideas and celebration history

### Note Model
- Content and categorization
- Tags and search functionality
- Pinning and archiving capabilities

### Reminder Model
- Exam and assignment reminders
- Priority and status tracking
- Notification settings

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Comprehensive data validation
- **Helmet**: Security headers
- **Data Sanitization**: XSS and injection prevention

## 🚀 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Compression**: Gzip compression for responses
- **Caching**: Strategic caching implementation
- **Pagination**: Efficient data loading
- **Aggregation**: Complex queries using MongoDB aggregation

## 📊 Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/dooit` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Made with ❤️ for the DOOIT Student Planner & Lifestyle Dashboard**