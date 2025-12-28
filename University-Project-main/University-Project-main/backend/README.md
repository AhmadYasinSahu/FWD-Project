# Research Grant Application Backend API

A comprehensive Node.js/Express backend API for the Air University Research Grant Application System.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User, Reviewer, Admin)
  - Email verification
  - Password reset functionality

- **User Management**
  - User registration and profile management
  - Profile picture upload
  - Password change functionality

- **Research Information Management**
  - Personal information management
  - Educational background tracking
  - Employment history management
  - File upload support

- **Research Grant Applications**
  - Complete CRUD operations for applications
  - Application status tracking (Draft, Submitted, Under Review, Approved, Rejected)
  - File attachments support
  - Progress reporting
  - Review and approval system

- **Admin Features**
  - User management and statistics
  - Application review and approval
  - Comprehensive analytics and reporting
  - Email notifications

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Email**: Nodemailer
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment variables template
   cp env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

4. **Environment Variables**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/research_grant_db
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   EMAIL_FROM=noreply@au.edu.pk
   
   # File Upload Configuration
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   
   # Security
   BCRYPT_ROUNDS=12
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/me` | Get current user | Private |
| POST | `/api/auth/forgot-password` | Forgot password | Public |
| PUT | `/api/auth/reset-password` | Reset password | Public |
| GET | `/api/auth/verify-email` | Verify email | Public |
| POST | `/api/auth/resend-verification` | Resend verification email | Private |

### User Management Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users/profile` | Get user profile | Private |
| PUT | `/api/users/profile` | Update user profile | Private |
| POST | `/api/users/profile-picture` | Upload profile picture | Private |
| PUT | `/api/users/change-password` | Change password | Private |
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get single user | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| GET | `/api/users/stats/overview` | User statistics | Admin |

### Research Information Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/research/personal` | Get personal information | Private |
| POST | `/api/research/personal` | Create/Update personal information | Private |
| POST | `/api/research/personal/profile-picture` | Upload profile picture | Private |
| GET | `/api/research/educational` | Get educational information | Private |
| POST | `/api/research/educational` | Add educational information | Private |
| PUT | `/api/research/educational/:id` | Update educational information | Private |
| DELETE | `/api/research/educational/:id` | Delete educational information | Private |
| GET | `/api/research/employment` | Get employment information | Private |
| POST | `/api/research/employment` | Add employment information | Private |
| PUT | `/api/research/employment/:id` | Update employment information | Private |
| DELETE | `/api/research/employment/:id` | Delete employment information | Private |

### Application Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/applications` | Get user applications | Private |
| GET | `/api/applications/:id` | Get single application | Private |
| POST | `/api/applications` | Create application | Private |
| PUT | `/api/applications/:id` | Update application | Private |
| POST | `/api/applications/:id/submit` | Submit application | Private |
| DELETE | `/api/applications/:id` | Delete application | Private |
| POST | `/api/applications/:id/attachments` | Upload attachments | Private |
| POST | `/api/applications/:id/progress` | Add progress report | Private |

### Admin Application Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/applications/admin/all` | Get all applications | Admin/Reviewer |
| GET | `/api/applications/admin/status/:status` | Get applications by status | Admin/Reviewer |
| PUT | `/api/applications/admin/:id/review` | Review application | Admin/Reviewer |
| GET | `/api/applications/admin/stats` | Application statistics | Admin |

## Data Models

### User Model
```javascript
{
  name: String,
  email: String,
  employeeId: String,
  password: String,
  phone: String,
  cnic: String,
  city: String,
  profilePicture: String,
  department: String,
  designation: String,
  isActive: Boolean,
  isEmailVerified: Boolean,
  role: String,
  lastLogin: Date
}
```

### Personal Information Model
```javascript
{
  userId: ObjectId,
  title: String,
  firstName: String,
  middleName: String,
  lastName: String,
  fatherName: String,
  dob: Date,
  maritalStatus: String,
  gender: String,
  permanentAddress: String,
  permanentCountry: String,
  permanentCity: String,
  mailingAddress: String,
  mailingCountry: String,
  mailingCity: String,
  cnic: String,
  nationality: String,
  profilePicture: String
}
```

### Educational Information Model
```javascript
{
  userId: ObjectId,
  qualificationLevel: String,
  incomplete: Boolean,
  enrolled: Boolean,
  startDate: Date,
  endDate: Date,
  country: String,
  city: String,
  institute: String,
  programTitle: String,
  discipline: String,
  campus: String,
  department: String,
  degreeType: String,
  sessionType: String,
  major: String,
  researchArea: String,
  isHighestEducation: Boolean,
  isVerified: Boolean
}
```

### Employment Information Model
```javascript
{
  userId: ObjectId,
  organizationType: String,
  country: String,
  sector: String,
  category: String,
  employerName: String,
  centers: String,
  addressCountry: String,
  addressCity: String,
  addressLine: String,
  contactCountryCode: String,
  contactNumber: String,
  officeEmail: String,
  website: String,
  startDate: Date,
  endDate: Date,
  currentlyWorking: Boolean,
  jobType: String,
  jobTitle: String,
  fieldOfWork: String,
  careerLevel: String,
  jobDescription: String,
  isCurrentEmployment: Boolean,
  isVerified: Boolean
}
```

### Research Grant Application Model
```javascript
{
  userId: ObjectId,
  researchTitle: String,
  researchArea: String,
  duration: Number,
  budgetRequested: Number,
  researchAbstract: String,
  status: String,
  reviewerId: ObjectId,
  reviewComments: String,
  reviewDate: Date,
  approvedBudget: Number,
  fundingStartDate: Date,
  fundingEndDate: Date,
  progressReports: Array,
  attachments: Array,
  submittedAt: Date,
  deadline: Date
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## File Upload

The API supports file uploads for:
- Profile pictures (images only, max 2MB)
- Application attachments (PDFs, Word docs, max 10MB)

Files are stored in the `uploads/` directory and served statically.

## Error Handling

The API returns consistent error responses:

```javascript
{
  "success": false,
  "error": "Error message"
}
```

## Success Responses

Successful operations return:

```javascript
{
  "success": true,
  "message": "Operation message",
  "data": { /* response data */ }
}
```

## Rate Limiting

The API implements rate limiting:
- 100 requests per 15 minutes per IP address
- Applied to all `/api/` routes

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Express-validator
- **Password Hashing**: bcryptjs
- **JWT**: Secure token-based authentication
- **File Upload Security**: File type and size validation

## Email Notifications

The system sends email notifications for:
- Email verification
- Password reset
- Application status updates

### Email Setup

- Development (no real emails): set `EMAIL_USE_ETHEREAL=true` in `.env`. Preview links will be logged in the server output.
- Production (real emails):
  - Recommended: Gmail with App Password. Enable 2‑Step Verification, create an App Password, then set `EMAIL_SERVICE=gmail`, `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_FROM`.
  - Custom SMTP: set `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`.
  - Ensure `FRONTEND_URL` points to your deployed frontend so reset/verify links work.

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB connection
3. Set up proper email credentials
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Use PM2 or similar process manager

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team at Air University.
