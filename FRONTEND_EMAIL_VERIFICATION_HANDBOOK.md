# Frontend Handoff: Registration + Email Verification Flow

This document explains how the frontend should connect to the backend registration flow for student/teacher signup with email verification.

## Backend Base URL

Local development:

```text
http://localhost:5000
```

All auth routes are under:

```text
/api/auth
```

---

## Flow Summary

1. User fills the registration form.
2. Frontend sends the form to `POST /api/auth/register`.
3. Backend creates the user with `emailVerified = false`.
4. Backend generates a 6-digit verification code.
5. Backend attempts to send the code by email.
6. If email sending fails in development, the register response includes the `verificationCode`.
7. Frontend shows a verify-code screen.
8. Frontend sends email + code to `POST /api/auth/verify-email`.
9. After verification, user can log in normally.

---

## Register Endpoint

### `POST /api/auth/register`

### Request body

```json
{
  "email": "newstudent@example.com",
  "password": "password123",
  "name": "New Student",
  "role": "student",
  "grade": "6",
  "institute": "Focus Hadungamuwa"
}
```

### Notes
- `role` is optional. Default is `student`.
- `grade` and `institute` are supported.
- For students, backend auto-seeds 2 class records for the grade.
- Backend auto-generates a verification code.

### Success response

```json
{
  "message": "User registered successfully",
  "userId": "uuid-here"
}
```

If SMTP is not available in development, the response may also include:

```json
{
  "message": "User registered successfully",
  "userId": "uuid-here",
  "verificationCode": "123456"
}
```

---

## Verify Email Endpoint

### `POST /api/auth/verify-email`

### Request body

```json
{
  "email": "newstudent@example.com",
  "code": "123456"
}
```

### Success response

```json
{
  "message": "Email verified successfully"
}
```

### Error response examples

```json
{
  "statusCode": 400,
  "message": "Invalid verification code"
}
```

```json
{
  "statusCode": 400,
  "message": "User not found"
}
```

---

## Login Endpoint

### `POST /api/auth/login`

### Request body

```json
{
  "email": "newstudent@example.com",
  "password": "password123"
}
```

### Success response

```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "uuid-here",
    "email": "newstudent@example.com",
    "name": "New Student",
    "role": "student",
    "grade": "6",
    "institute": "Focus Hadungamuwa"
  }
}
```

### Verification restriction
- If the user has not verified their email, login should be blocked by backend.
- Frontend should display the backend message and ask the user to verify the code first.

---

## Frontend UI Recommendation

### Registration page
After submitting the register form:
- Show success message.
- If response contains `verificationCode`, display it only for development/testing.
- Otherwise, show a field to enter the code received by email.
- Submit email + code to `/api/auth/verify-email`.

### Suggested frontend states
- `registerForm`
- `verificationStep`
- `verificationCode`
- `verifiedSuccess`

### Suggested flow
1. Register user.
2. Move to verification step.
3. Verify email code.
4. Redirect to login or dashboard.

---

## Example Frontend Calls

### Register

```js
const res = await api.post('/api/auth/register', {
  email,
  password,
  name,
  role: 'student',
  grade,
  institute,
});
```

### Verify email

```js
const verifyRes = await api.post('/api/auth/verify-email', {
  email,
  code,
});
```

### Login

```js
const loginRes = await api.post('/api/auth/login', {
  email,
  password,
});
```

---

## Important Notes for Frontend

- Do not send SMTP credentials from the frontend.
- Frontend only needs the API base URL.
- The backend handles email sending and verification code logic.
- For development without real SMTP, the backend may return the verification code in the response.

---

## Auto-Seeded Classes for Students

When a student registers with a grade, backend creates two class records:

- `Science Grade <grade>` at `Prebhashi Hettipola`
- `Science Grade <grade>` at `Focus Hadungamuwa`

These records are auto-enrolled for the student.

---

## Example React Flow

```js
// 1. Register
const registerResponse = await api.post('/api/auth/register', formData);

// 2. If backend returns verificationCode (dev only), use it.
if (registerResponse.data.verificationCode) {
  setDevCode(registerResponse.data.verificationCode);
}

// 3. Verify email
await api.post('/api/auth/verify-email', {
  email: formData.email,
  code: enteredCode,
});

// 4. Then allow login
```

---

## Backend Status

- Registration: implemented
- Email code generation: implemented
- Verify endpoint: implemented
- Login gating for unverified users: implemented
- Student class seeding by grade: implemented
- Backend build: passes

---

## Contact Points for Frontend Integration

If the frontend needs to show real-time messages:
- On successful register: show "Check your email for the verification code".
- On invalid code: show backend error message.
- On verified success: redirect to login.
- On login blocked: show "Please verify your email first".
