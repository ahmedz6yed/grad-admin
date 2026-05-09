# User Authentication API Documentation

**Base URL:** `http://localhost:3000/api`

---

## Authentication Overview

### Token Type

JWT Bearer Token (JSON Web Token)

### Token Lifecycle

- **Access Token Expiration:** 30 minutes
- **Token Issuance:** Returned in response body under `token` field
- **Authorization Header Format:** `Authorization: Bearer <token>`
- **Logout:** Token is blacklisted via `verifyToken` middleware using JWT `jti` (JWT ID)
- **No Refresh Tokens:** Frontend must re-authenticate after expiration

### Auth Middleware

`verifyToken` (src/Middlewares/verifytoken.js)

- Extracts `Authorization` header
- Validates JWT signature using `JWT_KEY`
- Checks token blacklist via `jti`
- Verifies user exists, is not deleted, not suspended, not banned
- Attaches user object to `req.currentUser`

### Token Storage Recommendation

Store token in memory or secure HTTP-only cookie. If using localStorage, ensure XSS protection.

---

## POST /user/register

Register a new user account.

### Headers

No authentication required

### Request

**Content-Type:** `application/json`

```json
{
  "name": {
    "first": "Ahmed",
    "last": "Zayed"
  },
  "userName": "ahmedzayed",
  "dateOfBirth": "01-01-1995",
  "gender": 0,
  "phoneNumber": "01012345678",
  "email": "ahmed@example.com",
  "password": "Pass1234",
  "confirmPassword": "Pass1234",
  "ssn": "12345678901234",
  "address": {
    "government": "Cairo",
    "city": "Cairo",
    "street": "123 Main St"
  },
  "role": "user",
  "categoryId": "507f1f77bcf86cd799439011"
}
```

**Field Types:**

- `gender`: `0` = male, `1` = female (boolean/integer)
- `dateOfBirth`: String in format `DD-MM-YYYY`
- `phoneNumber`: Egyptian mobile only (validated with `ar-EG` format)
- `password`: Min 8 chars, requires uppercase, lowercase, and number
- `ssn`: Exactly 14 numeric digits
- `role`: Optional, defaults to `user`, options: `user`, `worker`, `admin`
- `categoryId`: Required if role is `worker`, MongoDB ObjectId

### Success Response (201 Created)

**Content-Type:** `application/json`

```json
{
  "status": "success",
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "ahmed@example.com",
      "userName": "ahmedzayed",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** Temporary 30-minute token returned. Email verification OTP is sent.

### Error Responses

```json
{
  "status": "fail",
  "message": "Registration failed. Email is already in use."
}
```

```json
{
  "status": "fail",
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "msg": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
  ]
}
```

**Common Errors:**

- `400`: Duplicate email/phoneNumber/userName/SSN
- `400`: Validation errors (see schema)
- `400`: Disposable email domains rejected

---

## POST /user/login

Authenticate user with email and password.

### Headers

No authentication required

### Request

**Content-Type:** `application/json`

```json
{
  "email": "ahmed@example.com",
  "password": "Pass1234"
}
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "successfully signed",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "ahmed@example.com",
    "userName": "ahmedzayed",
    "name": {
      "first": "Ahmed",
      "last": "Zayed"
    },
    "role": "user",
    "avatar": "https://cloudinary.com/..."
  }
}
```

**Token expires in 30 minutes.**

### Error Responses

```json
{
  "status": "fail",
  "data": null,
  "message": "email and password doesn't match"
}
```

```json
{
  "status": "error",
  "message": "Your account is permanently banned. Reason: Violation of terms"
}
```

```json
{
  "status": "error",
  "message": "Your account is suspended until May 10, 2026. Reason: Under review"
}
```

---

## POST /user/google

Authenticate/register via Google OAuth.

### Headers

No authentication required

### Request

**Content-Type:** `application/json`

```json
{
  "token": "google-oauth-id-token-from-frontend"
}
```

**Note:** The `token` is the Google ID token obtained from Google Sign-In SDK.

### Success Response (200 OK)

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "needsPhoneNumber": true,
  "needsSSn": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "userName": "ahmed1234",
    "name": {
      "first": "Ahmed",
      "last": "Zayed"
    },
    "email": "ahmed@example.com",
    "phoneNumber": null,
    "avatar": "https://lh3.googleusercontent.com/...",
    "role": "user"
  }
}
```

**Token expires in 30 days.**

**Important Flags:**

- `needsPhoneNumber`: `true` if user must complete profile with phone
- `needsSSn`: `true` if user must add SSN

### Error Responses

```json
{
  "message": "Google token is required"
}
```

---

## POST /user/completeProfile

Complete profile after Google login (add phone & SSN).

### Headers

**Requires Bearer token**

### Request

**Content-Type:** `application/json`

```json
{
  "phoneNumber": "01012345678",
  "ssn": "12345678901234"
}
```

**Validation:**

- `phoneNumber`: Egyptian mobile, required, unique
- `ssn`: Exactly 14 digits, required, unique

### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Profile completed successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "userName": "ahmed1234",
      "name": {
        "first": "Ahmed",
        "last": "Zayed"
      },
      "email": "ahmed@example.com",
      "phoneNumber": "01012345678",
      "ssn": "12345678901234",
      "avatar": "https://lh3.googleusercontent.com/...",
      "role": "user"
    }
  }
}
```

### Error Responses

```json
{
  "status": "error",
  "message": "Phone number is already in use"
}
```

```json
{
  "status": "error",
  "message": "SSN is already in use"
}
```

---

## POST /user/confirmEmail

Verify email with OTP sent during registration.

### Headers

**Requires Bearer token**

### Request

**Content-Type:** `application/json`

```json
{
  "otp": "123456"
}
```

**OTP Constraints:**

- 6 digits numeric
- Expires in 10 minutes
- One per registration session

### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Your email has been verified successfully"
}
```

### Error Responses

```json
{
  "status": "error",
  "message": "OTP has expired. Please request a new one"
}
```

```json
{
  "status": "error",
  "message": "Invalid OTP"
}
```

```json
{
  "status": "error",
  "message": "Email is already verified"
}
```

---

## POST /user/resend-confirmation-otp

Request new email verification OTP.

### Headers

**Requires Bearer token**

### Request

No body required (user identified from token)

### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "A new verification OTP has been sent to your email."
}
```

**Rate Limit:** 60 seconds cooldown between requests.

### Error Responses

```json
{
  "status": "error",
  "message": "Please wait 45 seconds before requesting a new OTP."
}
```

```json
{
  "status": "error",
  "message": "Email is already verified"
}
```

---

## POST /user/forgotPassword

Request password reset OTP.

### Headers

No authentication required

### Request

**Content-Type:** `application/json`

```json
{
  "email": "ahmed@example.com"
}
```

**Note:** Always returns 200 even if email not found (security).

### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "If the email exists and is verified, a reset OTP has been sent"
}
```

### Error Responses

```json
{
  "status": "error",
  "message": "Please verify your email before requesting a password reset"
}
```

**Rate Limit:** 60 seconds cooldown between requests for the same email.

---

## POST /user/resetPassword

Reset password using OTP from email.

### Headers

No authentication required

### Request

**Content-Type:** `application/json`

```json
{
  "email": "ahmed@example.com",
  "otp": "123456",
  "newPassword": "NewPass1234"
}
```

**Password Requirements:**

- Min 8, max 100 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Password reset successfully"
}
```

### Error Responses

```json
{
  "status": "error",
  "message": "Email, OTP and new password are required"
}
```

```json
{
  "status": "error",
  "message": "Invalid or expired OTP"
}
```

**Rate Limit:** 60 seconds cooldown between requests.

---

## POST /user/verify-identity

Submit identity verification images (ID & live selfie) for AI verification.

### Headers

**Requires Bearer token**

### Content-Type

`multipart/form-data`

### Request Body (FormData)

```js
const formData = new FormData();
formData.append('id_image', fileInput.files[0]); // Front + back of ID
formData.append('live_image', fileInput.files[1]); // Live selfie
```

**Field Details:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id_image` | File (image) | Yes | Clear photo of government ID |
| `live_image` | File (image) | Yes | Live selfie for liveness detection |

**File Requirements:**

- Supported formats: JPEG, PNG
- Max file size: 5MB each (enforced by server)
- Images sent to Python AI service for face matching & liveness check

### Success Response (200 OK)

```json
{
  "status": "success",
  "match": true,
  "details": {
    "faceMatch": true,
    "liveness": true,
    "similarity": 0.95,
    "confidence": "high",
    "threshold": 0.85,
    "timings": {
      "face_detection": 0.45,
      "face_matching": 0.12,
      "liveness_check": 0.33
    }
  }
}
```

**Status Values:**

- `match: true` — identity fully verified (face match + liveness passed)
- `match: false` — verification failed; may be `pending` admin review if similarity close to threshold

**User `identityVerification.status` becomes:**

- `verified` — if match and liveness both true
- `pending` — if liveness passed but face similarity near threshold (awaiting admin)
- `failed` — otherwise

### Error Responses

```json
{
  "status": "error",
  "message": "Both id_image and live_image are required"
}
```

```json
{
  "status": "error",
  "message": "AI verification service is not running. Please start the Python service on port 5000."
}
```

---

## POST /user/upload

Upload profile avatar image (replace existing).

### Headers

**Requires Bearer token**

### Content-Type

`multipart/form-data`

### Request Body (FormData)

```js
const formData = new FormData();
formData.append('file', fileInput.files[0]);
```

**Field:**

- `file`: Image file (JPEG/PNG)

**Storage:** Uploaded to Cloudinary under folder `FixPay/users/{userId}`

### Success Response (200 OK)

```json
{
  "message": "Profile image updated successfully",
  "file": {
    "_id": "507f1f77bcf86cd799439011",
    "userName": "ahmedzayed",
    "name": { "first": "Ahmed", "last": "Zayed" },
    "email": "ahmed@example.com",
    "phoneNumber": "01012345678",
    "ssn": "12345678901234",
    "avatar": "https://res.cloudinary.com/.../user/avatar.jpg",
    "role": "user"
  }
}
```

---

## POST /user/logout

Invalidate current session / blacklist token.

### Headers

**Requires Bearer token**

### Request

No body required

### Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "tokenId": "uuid-jti-from-token",
    "createdAt": "2026-05-09T10:30:00.000Z",
    "expiresAt": "2026-05-09T10:30:00.000Z"
  },
  "message": "logged out successfully"
}
```

**Effect:** Token's `jti` is saved to blacklist; future requests with this token are rejected.

---

## Example Axios Usage

### Login & Store Token

```js
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// Login
const loginUser = async (email, password) => {
  const response = await axios.post(`${API_BASE}/user/login`, {
    email,
    password
  });

  const { token, user } = response.data.data || response.data;

  // Store token (example: localStorage)
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(user));

  return { token, user };
};
```

### Authenticated Request

```js
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const getProfile = async () => {
  const token = localStorage.getItem('authToken');

  const response = await axios.get(`${API_BASE}/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};
```

### Google Login

```js
const googleLogin = async (googleIdToken) => {
  const response = await axios.post(`${API_BASE}/user/google`, {
    token: googleIdToken
  });

  const { token, needsPhoneNumber, needsSSn, user } = response.data;

  if (needsPhoneNumber || needsSSn) {
    // Redirect to complete profile page
  }

  return { token, user };
};
```

### Verify Identity (multipart/form-data)

```js
const verifyIdentity = async (idFile, selfieFile) => {
  const token = localStorage.getItem('authToken');
  const formData = new FormData();

  formData.append('id_image', idFile);
  formData.append('live_image', selfieFile);

  const response = await axios.post(`${API_BASE}/user/verify-identity`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};
```

### Upload Profile Image

```js
const uploadAvatar = async (file) => {
  const token = localStorage.getItem('authToken');
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_BASE}/user/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.file; // updated user object with new avatar URL
};
```

### Logout

```js
const logoutUser = async () => {
  const token = localStorage.getItem('authToken');

  await axios.post(`${API_BASE}/user/logout`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};
```

---

## Error Handling Pattern

All errors follow this structure:

```json
{
  "status": "error" | "fail",
  "message": "Human-readable error message",
  "errors": [ // validation errors only
    {
      "field": "email",
      "msg": "Invalid email format",
      "param": "email",
      "location": "body"
    }
  ]
}
```

**HTTP Status Ranges:**

- `2xx` — Success
- `400` — Validation / Bad Request
- `401` — Unauthorized (missing/invalid token)
- `403` — Forbidden (banned/suspended/email not verified)
- `404` — Not found
- `429` — Rate limit exceeded
- `500` — Server error

---

## Notes

- All authenticated endpoints require `Authorization: Bearer <token>` header
- Token must be refreshed (re-login) after 30-minute expiration
- Sensitive fields (`password`, `otp.value`, `ssn`, `googleId`) are excluded from user objects by default (`select: false` in schema)
- Identity verification requires Python AI service running on port 5000
- Rate limits apply to OTP endpoints (60s cooldown)
- OTP is 6-digit numeric, expires in 10 minutes
- Email must be verified before password reset
- `completeProfile` phone/SSN must be unique across users
- `phoneNumber` is normalized: all non-digits stripped before save
---------------------------------------------------------------------------
TESTS
login