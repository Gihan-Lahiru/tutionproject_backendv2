# Quick Start Guide

Get your Tuition Sir Backend running in 5 minutes!

## 1️⃣ Clone & Install

```bash
# Clone repository
git clone <repo-url>
cd tutionproject_backendv2

# Install dependencies
npm install
```

## 2️⃣ Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
```

**Minimal .env.local:**
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=dev-secret-key-change-in-production
DB_TYPE=sqlite
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 3️⃣ Start Development Server

```bash
npm run dev
```

Output:
```
🚀 Server running on http://localhost:5000
📚 Swagger docs available at http://localhost:5000/docs
```

## 4️⃣ Test the API

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "password123",
    "name": "John Teacher",
    "role": "teacher"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "userId": "abc-123-def"
}
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "abc-123-def",
    "email": "teacher@example.com",
    "name": "John Teacher",
    "role": "teacher"
  }
}
```

### 3. Create a Class (Using token)
```bash
curl -X POST http://localhost:5000/api/classes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mathematics 101",
    "grade": "10",
    "subject": "Math",
    "time": "10:00 AM",
    "fee": 500
  }'
```

## 🗄️ Database

### Using SQLite (Default)
- Automatically created at project root: `tuition_sir.db`
- No additional setup needed
- Perfect for development

### Switching to MySQL
1. Edit `.env.local`:
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=tuition_sir
```

2. Create database:
```bash
mysql -u root -p
CREATE DATABASE tuition_sir;
```

3. Restart server - schema will auto-sync

## 📚 API Documentation

Visit **http://localhost:5000/docs** for interactive Swagger documentation

## 🔑 API Keys Needed

1. **Cloudinary** (for file uploads)
   - Sign up at https://cloudinary.com
   - Get your API credentials from dashboard
   - Add to `.env.local`

2. **JWT Secret** (for authentication)
   - Use any strong random string
   - Change in production!

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Change port in .env.local
PORT=5001
```

### Database Lock Error
```bash
# Delete SQLite database and restart
rm tuition_sir.db
npm run dev
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Connection Refused
- Ensure database server is running
- Check DB credentials in `.env.local`
- For MySQL: `mysql -u root -p` to verify

## 📁 Project Structure

```
src/
├── auth/              ← Authentication
├── classes/           ← Class Management
├── assignments/       ← Assignments
├── users/             ← User Management
├── payments/          ← Payments
├── notes/             ← Study Notes
├── videos/            ← Videos
├── papers/            ← Past Papers
├── notifications/     ← Notifications
└── common/            ← Shared code
```

## ✨ Available Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run start:prod` | Run production build |
| `npm test` | Run tests |
| `npm run lint` | Check code style |
| `npm run format` | Auto-format code |

## 🚀 Next Steps

1. ✅ Explore API docs at `/docs`
2. ✅ Test endpoints with Postman/Insomnia
3. ✅ Read [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for architecture details
4. ✅ Check [README.md](./README.md) for full documentation
5. ✅ Create your first class and assignment!

## 📞 Need Help?

- Check the [README.md](./README.md)
- Read [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- Review API docs at `http://localhost:5000/docs`
- Check error logs in console

---

**Happy Coding! 🎉**
