# Backend Setup Guide

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
# See Environment Variables section below
```

### 3. Start MongoDB
Make sure MongoDB is running on your system.

### 4. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. Test the API
Visit: `http://localhost:5000/api/health`

---

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/research_grant_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=7d

# Email Configuration (for password reset and notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM=noreply@au.edu.pk

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=12
```

### Email Setup (Optional)
If you want to enable email notifications:

1. **Gmail Setup:**
   - Enable 2-factor authentication
   - Generate an App Password
   - Use the App Password in EMAIL_PASS

2. **Other Email Providers:**
   - Update EMAIL_HOST and EMAIL_PORT accordingly
   - Use appropriate credentials

---

## Database Setup

### MongoDB Installation

#### Windows:
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. MongoDB service should start automatically

#### macOS:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu):
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Database Creation
The database will be created automatically when you first start the application.

---

## API Testing

### Using Postman

1. **Import the collection** (if available)
2. **Set up environment variables:**
   - `base_url`: `http://localhost:5000/api`
   - `token`: (will be set after login)

3. **Test the endpoints:**
   - Start with registration: `POST {{base_url}}/auth/register`
   - Login: `POST {{base_url}}/auth/login`
   - Use the returned token for authenticated requests

### Using curl

```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@au.edu.pk",
    "employeeId": "AUTO-0001",
    "password": "password123",
    "phone": "03123456789",
    "cnic": "12345-1234567-1",
    "city": "Islamabad"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "AUTO-0001",
    "password": "password123"
  }'
```

---

## File Structure

```
backend/
├── models/                    # Database models
│   ├── User.js
│   ├── PersonalInformation.js
│   ├── EducationalInformation.js
│   ├── EmploymentInformation.js
│   └── ResearchGrantApplication.js
├── routes/                    # API routes
│   ├── auth.js
│   ├── users.js
│   ├── research.js
│   └── applications.js
├── middleware/                # Custom middleware
│   ├── auth.js
│   ├── upload.js
│   ├── errorHandler.js
│   └── notFound.js
├── utils/                     # Utility functions
│   ├── generateToken.js
│   └── sendEmail.js
├── uploads/                   # File uploads directory
├── server.js                  # Main server file
├── package.json
├── env.example
├── .env                       # Environment variables (create this)
├── .gitignore
├── README.md
├── API_DOCUMENTATION.md
└── SETUP_GUIDE.md
```

---

## Features Overview

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (User, Reviewer, Admin)
- Email verification
- Password reset functionality

### User Management
- User registration and profile management
- Profile picture upload
- Password change functionality
- Admin user management

### Research Information Management
- Personal information management
- Educational background tracking
- Employment history management
- File upload support

### Research Grant Applications
- Complete CRUD operations
- Application status tracking
- File attachments
- Progress reporting
- Review and approval system

### Admin Features
- User management and statistics
- Application review and approval
- Comprehensive analytics
- Email notifications

---

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Express-validator
- **Password Hashing**: bcryptjs
- **JWT**: Secure token-based authentication
- **File Upload Security**: Type and size validation

---

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify MongoDB installation

2. **Port Already in Use:**
   - Change PORT in .env file
   - Kill process using the port: `lsof -ti:5000 | xargs kill -9`

3. **Email Not Working:**
   - Check email credentials in .env
   - Verify SMTP settings
   - Check firewall settings

4. **File Upload Issues:**
   - Ensure uploads directory exists
   - Check file size limits
   - Verify file types

5. **JWT Token Issues:**
   - Check JWT_SECRET in .env
   - Ensure token is included in Authorization header
   - Verify token expiration

### Logs
Check console output for detailed error messages. The server logs all errors and requests.

---

## Production Deployment

### 1. Environment Setup
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
# ... other production settings
```

### 2. Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "research-grant-api"

# Monitor
pm2 monit

# Logs
pm2 logs
```

### 3. Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL Certificate
Use Let's Encrypt or your preferred SSL provider.

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Forgot password
- `PUT /api/auth/reset-password` - Reset password

### User Management
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/profile-picture` - Upload picture
- `PUT /api/users/change-password` - Change password

### Research Information
- `GET /api/research/personal` - Get personal info
- `POST /api/research/personal` - Save personal info
- `GET /api/research/educational` - Get education
- `POST /api/research/educational` - Add education
- `GET /api/research/employment` - Get employment
- `POST /api/research/employment` - Add employment

### Applications
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Create application
- `PUT /api/applications/:id` - Update application
- `POST /api/applications/:id/submit` - Submit application
- `POST /api/applications/:id/attachments` - Upload files

### Admin (Admin/Reviewer only)
- `GET /api/applications/admin/all` - Get all applications
- `PUT /api/applications/admin/:id/review` - Review application
- `GET /api/applications/admin/stats` - Get statistics

---

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check server logs
4. Contact the development team

---

## License

This project is licensed under the ISC License.
