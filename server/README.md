# Mentora Backend API

A robust and scalable backend server for the Mentora learning platform, built with Express.js and MongoDB. This API provides comprehensive endpoints for user management, course handling, quiz functionality, and instructor applications.

## 🚀 Features

- User authentication and authorization
- Course management system
- Quiz creation and assessment
- Instructor application process
- File upload capabilities
- Course progress tracking
- Secure payment integration

## 🛠 Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**:
  - bcryptjs for password hashing
  - Cookie-parser for secure cookie handling
  - CORS for cross-origin resource sharing
- **File Upload**: Multer
- **Documentation**: Swagger/OpenAPI

## 🔧 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mentora-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Create a `.env` file in the root directory
   - Add the following configurations:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   SECRET_KEY=your_jwt_secret_key
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Documentation

### User Management
- `POST /api/v1/user/register` - Register a new user
- `POST /api/v1/user/login` - User login
- `POST /api/v1/user/logout` - User logout
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update user profile

### Course Management
- `GET /api/v1/courses` - List all courses
- `POST /api/v1/courses` - Create a new course (Instructor only)
- `GET /api/v1/courses/:id` - Get course details
- `PUT /api/v1/courses/:id` - Update course (Instructor only)
- `DELETE /api/v1/courses/:id` - Delete course (Instructor only)

### Quiz System
- `POST /api/v1/quiz` - Create a new quiz
- `GET /api/v1/quiz/:courseId` - Get quizzes for a course
- `POST /api/v1/quiz/attempt` - Submit quiz attempt
- `GET /api/v1/quiz/results/:attemptId` - Get quiz results

### Request Bodies

#### User Registration
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "student"
}
```

#### Course Creation
```json
{
  "title": "string",
  "description": "string",
  "price": "number",
  "category": "string",
  "thumbnail": "file"
}
```

## 📋 Data Models

### User Model
- name: String (required, min 3 characters)
- email: String (required, unique, validated)
- password: String (required, hashed)
- role: String (enum: ["instructor", "student"])
- enrolledCourses: Array of Course IDs
- photoUrl: String
- createdAt: Date
- updatedAt: Date

### Course Model
- title: String (required)
- description: String (required)
- instructor: Reference to User
- price: Number
- rating: Number
- students: Array of User IDs
- lectures: Array of Lecture IDs
- category: String
- thumbnail: String

## ⚙️ Environment Variables

- `PORT`: Server port number (default: 3000)
- `MONGO_URI`: MongoDB connection string
- `SECRET_KEY`: JWT secret key for token generation
- `NODE_ENV`: Development/Production environment
- `CORS_ORIGIN`: Allowed origins for CORS

## 🔒 Security Measures

- Password hashing using bcrypt
- JWT-based authentication
- Secure HTTP-only cookies
- CORS protection
- Request rate limiting
- Input validation and sanitization

## 🚨 Error Handling

The API implements a standardized error handling system:

```javascript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {} // Additional error details if any
  }
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
