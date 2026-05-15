# Frontend Axios Configuration Guide

This guide will help you set up Axios correctly in your React frontend to communicate with the Tuition Sir backend API.

## Problem
- Backend API runs on: `http://localhost:5000`
- Backend routes: `/api/auth/login`, `/api/classes`, etc.
- Frontend Axios baseURL was: `/api` (relative path)
- **Result**: Calling `/api/api/auth/login` → 401 Unauthorized ❌

## Solution: Update Axios Configuration

---

## Step 1: Create Axios Config File

Create a new file: `src/services/api.js` (or `src/api/client.js`)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add JWT Token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor - Handle Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Step 2: Create Auth Service

Create: `src/services/authService.js`

```javascript
import api from './api';

export const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });
      // Save JWT token to localStorage
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Register new user
  register: async (name, email, password, role = 'student') => {
    try {
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
        role,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
```

---

## Step 3: Update Login Component

Use the auth service in your login component:

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from './services/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login(email, password);
      console.log('✅ Login successful!', data);
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## Step 4: Create Additional Services

### Classes Service

Create: `src/services/classesService.js`

```javascript
import api from './api';

export const classesService = {
  getAll: () => api.get('/api/classes'),
  getById: (id) => api.get(`/api/classes/${id}`),
  create: (data) => api.post('/api/classes', data),
  update: (id, data) => api.put(`/api/classes/${id}`, data),
  delete: (id) => api.delete(`/api/classes/${id}`),
};
```

### Assignments Service

Create: `src/services/assignmentsService.js`

```javascript
import api from './api';

export const assignmentsService = {
  getAll: () => api.get('/api/assignments'),
  getById: (id) => api.get(`/api/assignments/${id}`),
  create: (data) => api.post('/api/assignments', data),
  submit: (id, data) => api.post(`/api/assignments/${id}/submit`, data),
  delete: (id) => api.delete(`/api/assignments/${id}`),
};
```

---

## Step 5: All Available Backend Endpoints

### Authentication
```javascript
POST   /api/auth/register         // Register new user
POST   /api/auth/login            // Login user
GET    /api/auth/me               // Get current user (requires JWT)
```

### Classes
```javascript
GET    /api/classes               // Get all classes
GET    /api/classes/:id           // Get specific class
POST   /api/classes               // Create class
PUT    /api/classes/:id           // Update class
DELETE /api/classes/:id           // Delete class
```

### Assignments
```javascript
GET    /api/assignments           // Get all assignments
GET    /api/assignments/:id       // Get specific assignment
POST   /api/assignments           // Create assignment
DELETE /api/assignments/:id       // Delete assignment
```

### Notes
```javascript
GET    /api/notes                 // Get all notes
POST   /api/notes                 // Create note
```

### Videos
```javascript
GET    /api/videos                // Get all videos
POST   /api/videos                // Upload video
```

### Payments
```javascript
GET    /api/payments              // Get all payments
POST   /api/payments              // Create payment
```

### Users
```javascript
GET    /api/users                 // Get all users
GET    /api/users/:id             // Get specific user
PUT    /api/users/:id             // Update user
```

---

## Step 6: Protected Routes

Create a ProtectedRoute component: `src/components/ProtectedRoute.jsx`

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
}
```

Use in your router:

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Troubleshooting

### ❌ 401 Unauthorized Error
- **Cause**: Invalid or missing JWT token
- **Fix**: Check localStorage has token, and token is being sent in Authorization header
- **Debug**: Open DevTools → Application → localStorage, verify `token` exists

### ❌ CORS Error
- **Cause**: Frontend and backend don't have matching CORS settings
- **Fix**: Backend CORS is already configured for `localhost:3000-3005`
- **Check**: Backend [src/main.ts](../src/main.ts) CORS origins

### ❌ 404 Not Found
- **Cause**: Wrong endpoint path
- **Fix**: Use `http://localhost:5000/api/...` not `/api/...`
- **Verify**: Check endpoint in DevTools Network tab

### ❌ Network Error / Connection Refused
- **Cause**: Backend not running
- **Fix**: Start backend with `npm run dev` or `npm start`
- **Verify**: Visit `http://localhost:5000/docs` in browser (should show Swagger docs)

---

## Testing the Setup

### 1. Test Backend is Running
```bash
# In backend terminal
npm run dev

# Output should show:
# 🚀 Server running on http://localhost:5000
# 📚 Swagger docs available at http://localhost:5000/docs
```

Visit `http://localhost:5000/docs` to test endpoints directly.

### 2. Test Frontend Axios

Open browser DevTools Console and run:

```javascript
import api from './services/api';

// Test register
api.post('/api/auth/register', {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'student'
}).then(r => console.log('Register:', r.data));

// Test login
api.post('/api/auth/login', {
  email: 'test@example.com',
  password: 'password123'
}).then(r => {
  console.log('Login:', r.data);
  localStorage.setItem('token', r.data.access_token);
});

// Test get current user
api.get('/api/auth/me').then(r => console.log('Current user:', r.data));
```

---

## Environment Variables

Create: `.env` in your frontend root

```env
REACT_APP_API_URL=http://localhost:5000
```

Then use in your code:

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});
```

---

## Summary

✅ **Axios baseURL**: `http://localhost:5000`  
✅ **JWT Token**: Automatically added to every request  
✅ **Error Handling**: Redirects to login on 401  
✅ **All endpoints**: Point to backend properly  
✅ **Protected Routes**: Implemented with React Router  

**Next Steps:**
1. Copy the axios config to your frontend
2. Create auth service
3. Update login component
4. Test the connection
5. Build other services as needed

---

**Questions?** Check backend Swagger docs at `http://localhost:5000/docs`
