# DOOIT Backend API

Backend API for DOOIT Student Planner & Lifestyle Dashboard built with Node.js, Express, and MongoDB.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
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
SESSION_SECRET=your_session_secret_here
CLIENT_URL=http://localhost:5173
```

### 3. Start MongoDB

#### Option A: MongoDB Community Server (Recommended)
1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   - **Windows**: MongoDB should start automatically as a service
   - **macOS**: `brew services start mongodb/brew/mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string and update `MONGODB_URI` in `.env`

#### Option C: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Generate Secure Keys
```bash
# Generate JWT_SECRET
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate SESSION_SECRET  
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Error**: `connect ECONNREFUSED ::1:27017`

**Solutions**:
1. **Check if MongoDB is running**:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services list | grep mongodb
   
   # Linux
   sudo systemctl status mongod
   ```

2. **Start MongoDB**:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb/brew/mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. **Alternative connection string** (if IPv6 issues):
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/dooit
   ```

### Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
6. Update `.env` with your credentials:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

## 📚 API Documentation

### Health Check
```http
GET /api/health
```

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout
```

### Resources
- Tasks: `/api/tasks`
- Events: `/api/events`
- Notes: `/api/notes`
- Reminders: `/api/reminders`
- Birthdays: `/api/birthdays`
- Trips: `/api/trips`

## 🔒 Security Features

- JWT Authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- XSS protection

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT secret key | Yes |
| `SESSION_SECRET` | Session secret | Yes |
| `CLIENT_URL` | Frontend URL | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | No |

## 🚀 Deployment

### Production Environment
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
SESSION_SECRET=your_production_session_secret
CLIENT_URL=https://yourdomain.com
```

### Build and Start
```bash
npm start
```

---

**Made with ❤️ for the DOOIT Student Planner & Lifestyle Dashboard**