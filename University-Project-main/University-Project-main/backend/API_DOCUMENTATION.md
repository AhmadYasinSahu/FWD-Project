# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@au.edu.pk",
  "employeeId": "AUTO-0001",
  "password": "password123",
  "phone": "03123456789",
  "cnic": "12345-1234567-1",
  "city": "Islamabad"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john.doe@au.edu.pk",
    "employeeId": "AUTO-0001",
    "role": "user",
    "isEmailVerified": false
  }
}
```

### 2. Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "employeeId": "AUTO-0001",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john.doe@au.edu.pk",
    "employeeId": "AUTO-0001",
    "role": "user",
    "isEmailVerified": true,
    "department": "Computer Science",
    "designation": "Assistant Professor"
  }
}
```

### 3. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john.doe@au.edu.pk",
    "employeeId": "AUTO-0001",
    "role": "user",
    "isEmailVerified": true,
    "department": "Computer Science",
    "designation": "Assistant Professor",
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Forgot Password
**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john.doe@au.edu.pk"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### 5. Reset Password
**PUT** `/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## User Management Endpoints

### 1. Get User Profile
**GET** `/users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john.doe@au.edu.pk",
      "employeeId": "AUTO-0001",
      "role": "user",
      "isEmailVerified": true,
      "department": "Computer Science",
      "designation": "Assistant Professor"
    },
    "personalInfo": {
      "title": "Dr",
      "firstName": "John",
      "lastName": "Doe",
      "fatherName": "James Doe",
      "dob": "1985-05-15T00:00:00.000Z",
      "maritalStatus": "married",
      "gender": "male"
    }
  }
}
```

### 2. Update User Profile
**PUT** `/users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "03123456789",
  "department": "Computer Science",
  "designation": "Associate Professor"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe Updated",
    "email": "john.doe@au.edu.pk",
    "employeeId": "AUTO-0001",
    "role": "user",
    "isEmailVerified": true,
    "department": "Computer Science",
    "designation": "Associate Professor"
  }
}
```

### 3. Upload Profile Picture
**POST** `/users/profile-picture`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
Form data with file field 'profilePicture'
```

**Response:**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "profilePicture": "/uploads/profilePicture-1234567890.jpg"
  }
}
```

### 4. Change Password
**PUT** `/users/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Research Information Endpoints

### 1. Personal Information

#### Get Personal Information
**GET** `/research/personal`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Dr",
    "firstName": "John",
    "lastName": "Doe",
    "middleName": "Michael",
    "fatherName": "James Doe",
    "dob": "1985-05-15T00:00:00.000Z",
    "maritalStatus": "married",
    "gender": "male",
    "permanentAddress": "123 Main Street",
    "permanentCountry": "Pakistan",
    "permanentCity": "Islamabad",
    "mailingAddress": "123 Main Street",
    "mailingCountry": "Pakistan",
    "mailingCity": "Islamabad",
    "sameAsPermanent": true,
    "cnic": "12345-1234567-1",
    "nationality": "Pakistan",
    "profilePicture": "/uploads/profile.jpg"
  }
}
```

#### Create/Update Personal Information
**POST** `/research/personal`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Dr",
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "fatherName": "James Doe",
  "dob": "1985-05-15",
  "maritalStatus": "married",
  "gender": "male",
  "permanentAddress": "123 Main Street",
  "permanentCountry": "Pakistan",
  "permanentCity": "Islamabad",
  "mailingAddress": "123 Main Street",
  "mailingCountry": "Pakistan",
  "mailingCity": "Islamabad",
  "sameAsPermanent": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Personal information saved successfully",
  "data": { /* personal information object */ }
}
```

### 2. Educational Information

#### Get Educational Information
**GET** `/research/educational`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "qualificationLevel": "Doctorate",
      "incomplete": false,
      "enrolled": false,
      "startDate": "2015-09-01T00:00:00.000Z",
      "endDate": "2019-08-31T00:00:00.000Z",
      "country": "Pakistan",
      "city": "Islamabad",
      "institute": "Air University",
      "discipline": "Computer Science",
      "degreeType": "PhD",
      "major": "Artificial Intelligence",
      "isHighestEducation": true
    }
  ]
}
```

#### Add Educational Information
**POST** `/research/educational`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "qualificationLevel": "Doctorate",
  "startDate": "2015-09-01",
  "country": "Pakistan",
  "city": "Islamabad",
  "institute": "Air University",
  "discipline": "Computer Science",
  "campus": "Main Campus",
  "department": "Computer Science",
  "degreeType": "PhD",
  "sessionType": "Morning",
  "major": "Artificial Intelligence",
  "researchArea": "Machine Learning"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Educational information added successfully",
  "data": { /* educational information object */ }
}
```

### 3. Employment Information

#### Get Employment Information
**GET** `/research/employment`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b5",
      "organizationType": "ACADEMIC",
      "country": "Pakistan",
      "sector": "Public",
      "category": "University",
      "employerName": "Air University",
      "jobType": "Full-time",
      "jobTitle": "Assistant Professor",
      "fieldOfWork": "Teaching",
      "careerLevel": "Mid",
      "startDate": "2020-01-01T00:00:00.000Z",
      "currentlyWorking": true,
      "isCurrentEmployment": true
    }
  ]
}
```

#### Add Employment Information
**POST** `/research/employment`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "organizationType": "ACADEMIC",
  "country": "Pakistan",
  "sector": "Public",
  "category": "University",
  "employerName": "Air University",
  "centers": "Center for Advanced Studies",
  "jobType": "Full-time",
  "jobTitle": "Assistant Professor",
  "fieldOfWork": "Teaching",
  "careerLevel": "Mid",
  "startDate": "2020-01-01",
  "currentlyWorking": true,
  "addressCountry": "Pakistan",
  "addressCity": "Islamabad",
  "addressLine": "Peshawar Avenue",
  "contactNumber": "051-1234567",
  "officeEmail": "john.doe@au.edu.pk"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Employment information added successfully",
  "data": { /* employment information object */ }
}
```

---

## Application Endpoints

### 1. Get User Applications
**GET** `/applications`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 10
    }
  },
  "data": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b6",
      "researchTitle": "AI in Education",
      "researchArea": "computer-science",
      "duration": 24,
      "budgetRequested": 500000,
      "status": "submitted",
      "submittedAt": "2024-01-15T10:30:00.000Z",
      "deadline": "2025-09-23T23:59:00.000Z"
    }
  ]
}
```

### 2. Get Single Application
**GET** `/applications/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b6",
    "researchTitle": "AI in Education",
    "researchArea": "computer-science",
    "researchAreaDisplay": "Computer Science & IT",
    "duration": 24,
    "budgetRequested": 500000,
    "formattedBudget": "₨500,000",
    "researchAbstract": "This research focuses on...",
    "status": "submitted",
    "submittedAt": "2024-01-15T10:30:00.000Z",
    "deadline": "2025-09-23T23:59:00.000Z",
    "daysUntilDeadline": 252,
    "isOverdue": false,
    "attachments": [
      {
        "fileName": "proposal.pdf",
        "filePath": "/uploads/proposal-1234567890.pdf",
        "fileType": "application/pdf",
        "uploadDate": "2024-01-15T10:30:00.000Z"
      }
    ],
    "progressReports": [
      {
        "reportDate": "2024-02-15T10:30:00.000Z",
        "progress": "Research methodology completed",
        "challenges": "Data collection delays",
        "nextSteps": "Begin data analysis"
      }
    ]
  }
}
```

### 3. Create Application
**POST** `/applications`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "researchTitle": "AI in Education",
  "researchArea": "computer-science",
  "duration": 24,
  "budgetRequested": 500000,
  "researchAbstract": "This research focuses on implementing artificial intelligence in educational settings to improve learning outcomes and student engagement."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application created successfully",
  "data": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b6",
    "researchTitle": "AI in Education",
    "researchArea": "computer-science",
    "duration": 24,
    "budgetRequested": 500000,
    "researchAbstract": "This research focuses on implementing artificial intelligence in educational settings to improve learning outcomes and student engagement.",
    "status": "draft",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Update Application
**PUT** `/applications/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "researchTitle": "AI in Education - Updated",
  "duration": 30,
  "budgetRequested": 750000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application updated successfully",
  "data": { /* updated application object */ }
}
```

### 5. Submit Application
**POST** `/applications/:id/submit`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": { /* application object with updated status */ }
}
```

### 6. Upload Attachments
**POST** `/applications/:id/attachments`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
Form data with files field 'files'
```

**Response:**
```json
{
  "success": true,
  "message": "Attachments uploaded successfully",
  "data": {
    "attachments": [
      {
        "fileName": "proposal.pdf",
        "filePath": "/uploads/proposal-1234567890.pdf",
        "fileType": "application/pdf",
        "uploadDate": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 7. Add Progress Report
**POST** `/applications/:id/progress`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "progress": "Research methodology completed",
  "challenges": "Data collection delays due to COVID-19",
  "nextSteps": "Begin data analysis phase"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Progress report added successfully",
  "data": { /* application object with new progress report */ }
}
```

---

## Admin Endpoints

### 1. Get All Applications (Admin/Reviewer)
**GET** `/applications/admin/all`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 10
    }
  },
  "data": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b6",
      "researchTitle": "AI in Education",
      "researchArea": "computer-science",
      "status": "submitted",
      "budgetRequested": 500000,
      "userId": {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "John Doe",
        "email": "john.doe@au.edu.pk",
        "employeeId": "AUTO-0001"
      },
      "reviewerId": null,
      "submittedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 2. Get Applications by Status
**GET** `/applications/admin/status/:status`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b6",
      "researchTitle": "AI in Education",
      "status": "submitted",
      "userId": {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "John Doe",
        "email": "john.doe@au.edu.pk",
        "employeeId": "AUTO-0001"
      }
    }
  ]
}
```

### 3. Review Application
**PUT** `/applications/admin/:id/review`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "approved",
  "reviewComments": "Excellent research proposal with clear methodology and realistic budget.",
  "approvedBudget": 450000,
  "fundingStartDate": "2024-02-01",
  "fundingEndDate": "2026-01-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application reviewed successfully",
  "data": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b6",
    "status": "approved",
    "reviewerId": "60f7b3b3b3b3b3b3b3b3b3b7",
    "reviewDate": "2024-01-20T10:30:00.000Z",
    "reviewComments": "Excellent research proposal with clear methodology and realistic budget.",
    "approvedBudget": 450000,
    "fundingStartDate": "2024-02-01T00:00:00.000Z",
    "fundingEndDate": "2026-01-31T00:00:00.000Z"
  }
}
```

### 4. Get Application Statistics
**GET** `/applications/admin/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalApplications": 25,
    "draftApplications": 5,
    "submittedApplications": 10,
    "underReviewApplications": 5,
    "approvedApplications": 3,
    "rejectedApplications": 2,
    "totalBudgetRequested": 12500000,
    "totalBudgetApproved": 3000000,
    "recentApplications": 8,
    "applicationsByArea": [
      {
        "_id": "computer-science",
        "count": 10
      },
      {
        "_id": "engineering",
        "count": 8
      }
    ],
    "applicationsByStatus": [
      {
        "_id": "submitted",
        "count": 10
      },
      {
        "_id": "draft",
        "count": 5
      }
    ]
  }
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

## File Upload Limits

- **Profile Pictures**: 2MB max, images only (JPEG, PNG, GIF)
- **Application Attachments**: 10MB max, documents only (PDF, Word)
- **General Files**: 5MB max, various formats

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Applied to all `/api/` routes

## Testing the API

You can test the API using tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

### Example curl commands:

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@au.edu.pk",
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

# Get user profile (with token)
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
