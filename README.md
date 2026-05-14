# Tuition Sir Backend - NestJS

A modern Learning Management System (LMS) backend built with NestJS, featuring authentication, class management, assignments, payments, and more.

## ✨ Features

- 🔐 **JWT Authentication** with role-based access control
- 📚 **Class Management** - Create and manage classes
- 📝 **Assignments & Submissions** - Assign and grade submissions
- 📄 **Notes & Papers** - Upload and manage study materials
- 🎥 **Video Content** - Manage educational videos
- 💳 **Payment Processing** - Payment tracking and management
- 🔔 **Notifications** - Real-time notifications
- 📊 **Analytics & Stats** - Dashboard insights
- 👤 **User Management** - Student and teacher profiles
- ☁️ **Cloud Storage** - Cloudinary integration for file uploads
- 📚 **API Documentation** - Swagger/OpenAPI integration

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ (v20 recommended)
- npm or yarn
- MySQL 8+ or SQLite (for development)
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tutionproject_backendv2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - API: http://localhost:5000
   - Swagger Docs: http://localhost:5000/docs

## 📖 Available Scripts

```bash
# Development
npm run dev              # Start dev server with watch mode
npm run debug           # Start with debugger

# Production
npm run build           # Build project
npm run start:prod      # Run production build

# Testing
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:cov        # Run tests with coverage

# Linting & Formatting
npm run lint            # Lint code
npm run format          # Format code with Prettier

# Database
npm run typeorm         # TypeORM CLI
npm run migration:run   # Run migrations
npm run migration:create # Create migration
```

## 🏗️ Project Structure

```
src/
├── auth/                      # Authentication & Authorization
│   ├── dto/                   # Data Transfer Objects
│   ├── strategies/            # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── classes/                   # Class Management
├── assignments/               # Assignments & Submissions
├── notes/                     # Study Notes
├── videos/                    # Video Content
├── payments/                  # Payment Management
├── users/                     # User Management
├── papers/                    # Past Papers
├── notifications/             # Notification System
├── stats/                     # Analytics
├── admin/                     # Admin Operations
├── common/                    # Shared utilities
│   ├── decorators/            # Custom decorators
│   ├── filters/               # Exception filters
│   ├── guards/                # Authorization guards
│   └── services/              # Shared services
├── config/                    # Configuration files
├── database/                  # Database entities
├── app.module.ts              # Root module
└── main.ts                    # Entry point
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class (Teacher only)
- `GET /api/classes/:id` - Get class details
- `PUT /api/classes/:id` - Update class (Teacher only)
- `DELETE /api/classes/:id` - Delete class (Teacher only)
- `GET /api/classes/:id/students` - Get class students
- `POST /api/classes/:id/enroll` - Enroll in class

### Assignments
- `GET /api/assignments/class/:classId` - Get class assignments
- `POST /api/assignments/:classId` - Create assignment
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments/:id/submit` - Submit assignment
- `PUT /api/assignments/:submissionId/grade` - Grade submission
- `GET /api/assignments/:assignmentId/submissions` - Get submissions

### Notes
- `GET /api/notes` - Get all notes
- `GET /api/notes/class/:classId` - Get class notes
- `POST /api/notes/class/:classId` - Upload note
- `DELETE /api/notes/:id` - Delete note

### Videos
- `GET /api/videos` - Get all videos
- `GET /api/videos/search` - Search videos by grade/subject
- `POST /api/videos` - Create video
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/my-payments` - Get my payments
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id/status` - Update payment status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/me` - Get current user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Admin
- `GET /api/admin/health` - System health (Admin only)
- `GET /api/admin/dashboard` - Admin dashboard (Admin only)
- `POST /api/admin/payments/:id/approve` - Approve payment (Admin only)
- `POST /api/admin/payments/:id/reject` - Reject payment (Admin only)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

### User Roles
- **student** - Can enroll in classes and submit assignments
- **teacher** - Can create and manage classes, grade submissions
- **admin** - Full system access

## 📦 Database

### TypeORM Configuration
The project uses TypeORM with support for:
- **Development**: SQLite (automatic synchronization)
- **Production**: MySQL/MariaDB (migrations required)

### Entities
- User
- Class
- Assignment
- Submission
- Note
- Video
- Payment
- Paper
- Notification

## ☁️ File Uploads

Files are uploaded to Cloudinary. Configure your credentials in `.env`:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 📝 Validation

The API uses `class-validator` for request validation. Invalid requests will return validation errors:

```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test file
npm run test auth.service.spec

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

## 🐳 Docker Deployment

### Build and Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f api
```

### Build Docker Image

```bash
docker build -t tuition-sir-api .
docker run -p 5000:5000 --env-file .env tuition-sir-api
```

## 📚 Deployment

### Vercel/AWS Lambda (Serverless)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in platform dashboard

### Traditional Server
1. Build: `npm run build`
2. Upload `dist` and `node_modules` to server
3. Install PM2: `npm install -g pm2`
4. Start: `pm2 start dist/main.js --name tuition-sir`

### Environment for Production

```env
NODE_ENV=production
PORT=5000
DB_TYPE=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=tuition_sir
JWT_SECRET=use-a-strong-random-key
```

## 🛠️ Troubleshooting

### Database Connection Issues
- Ensure database server is running
- Check connection credentials in `.env`
- For SQLite, ensure database file is writable

### JWT Errors
- Verify `JWT_SECRET` is set in `.env`
- Check token expiration (default: 24h)
- Ensure token format: `Bearer <token>`

### File Upload Failures
- Verify Cloudinary credentials
- Check file size limits
- Ensure CORS is properly configured

### Port Already in Use
```bash
# Kill process on port 5000
# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## 📖 API Documentation

Full Swagger/OpenAPI documentation available at: `http://localhost:5000/docs`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under MIT License - see LICENSE file for details

## 📞 Support

For issues and questions:
- Open a GitHub issue
- Contact: support@tutionsir.com
- Documentation: https://docs.tutionsir.com

---

**Last Updated**: May 2026  
**NestJS Version**: ^10.0.0  
**Node.js**: ^18.0.0  
**TypeORM**: ^0.3.17
