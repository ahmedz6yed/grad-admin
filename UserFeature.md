# User Feature Documentation

## Base URL

`http://localhost:3000/api/user`

---

## 1. GET / - Get All Users

**Functionality:** Retrieves a list of all users in the system (admin-only). Used for admin dashboard/user management.

**Authentication:** Required (`verifyToken`)

**Authorization:** Admin only (`allowedTo(Roles.admin)`)

**Query Parameters:** None

**Request Example:**

```
GET /api/user/
Headers: Authorization: Bearer <admin_token>
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "_id": "user_id",
        "name": {
          "first": "John",
          "last": "Doe"
        },
        "userName": "john_doe",
        "email": "john@example.com",
        "phoneNumber": "+201234567890",
        "role": "user",
        "avatar": "https://cloudinary.com/.../avatar.jpg",
        "rating": 4.5,
        "verifiedAt": "2026-05-01T10:00:00.000Z",
        "address": {
          "government": "Cairo",
          "city": "Cairo",
          "street": "123 Main St"
        },
        "locationCoords": {
          "lat": 30.0444,
          "lng": 31.2357
        },
        "identityVerification": {
          "status": "verified",
          "similarity": 0.98,
          "liveness": true,
          "verifiedAt": "2026-05-01T11:00:00.000Z"
        },
        "categoryId": "category_id", // Only for workers
        "createdAt": "2026-05-01T10:00:00.000Z",
        "updatedAt": "2026-05-01T10:00:00.000Z"
      }
    ]
  }
}
```

---

## 2. GET /:id - Get User By ID

**Functionality:** Fetches a specific user by their ID. Returns full user profile with sensitive fields excluded.

**Authentication:** Required (`verifyToken`)

**Authorization:** Any authenticated user (admins can view any user, regular users can view their own profile via this endpoint though typically they'd use their own token)

**URL Parameter:**

- `id`: MongoDB ObjectId of the user

**Request Example:**

```
GET /api/user/65f1234567890abc12345678
Headers: Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "_id": "user_id",
    "name": {
      "first": "John",
      "last": "Doe"
    },
    "userName": "john_doe",
    "email": "john@example.com",
    "phoneNumber": "+201234567890",
    "role": "user",
    "avatar": "https://cloudinary.com/.../avatar.jpg",
    "rating": 4.5,
    "verifiedAt": "2026-05-01T10:00:00.000Z",
    "address": {
      "government": "Cairo",
      "city": "Cairo",
      "street": "123 Main St"
    },
    "locationCoords": {
      "lat": 30.0444,
      "lng": 31.2357
    },
    "identityVerification": {
      "status": "verified",
      "similarity": 0.98,
      "liveness": true,
      "verifiedAt": "2026-05-01T11:00:00.000Z"
    },
    "categoryId": "category_id",
    "deleted": false,
    "createdAt": "2026-05-01T10:00:00.000Z",
    "updatedAt": "2026-05-01T10:00:00.000Z"
  }
}
```

**Error Responses:**

- `404 User not found`

---

## 3. PATCH /:id - Update User

**Functionality:** Updates user information. Admin-only endpoint for editing any user. Regular users can only edit their own profile via different endpoints (like `completeProfile` or `editUser` service).

**Authentication:** Required (`verifyToken`)

**Authorization:** Admin only (`allowedTo(Roles.admin)`)

**URL Parameter:**

- `id`: MongoDB ObjectId of the user to update

**Request Body (application/json):** Any combination of editable user fields (all optional):

- `name.first` (string)
- `name.last` (string)
- `userName` (string)
- `dateOfBirth` (string, DD-MM-YYYY format)
- `gender` (boolean: false=male, true=female, or 0/1, "male"/"female")
- `phoneNumber` (string, Egyptian mobile format)
- `email` (string, valid email)
- `avatar` (string, URL)
- `ssn` (string, 14 digits)
- `address.government` (string)
- `address.city` (string)
- `address.street` (string)
- `categoryId` (MongoDB ObjectId, only for workers)
- `role` (string: `user`, `worker`, `admin`, `customer`)

**Request Example:**

```
PATCH /api/user/65f1234567890abc12345678
Headers: Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "worker",
  "categoryId": "65f1234567890abc12345678"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "_id": "user_id",
    "name": {
      "first": "Updated",
      "last": "Name"
    },
    "userName": "updated_username",
    "email": "updated@example.com",
    "role": "worker",
    "categoryId": "category_id",
    "updatedAt": "2026-05-01T12:00:00.000Z"
  }
}
```

**Error Responses:**

- `400 BAD_REQUEST`
- `404 NOT_FOUND`

---

## 4. PATCH /assign-admin/:id - Assign Admin Role

**Functionality:** Promotes a user to admin role. Admin-only endpoint.

**Authentication:** Required (`verifyToken`)

**Authorization:** Admin only

**URL Parameter:**

- `id`: MongoDB ObjectId of the user to promote

**Request Example:**

```
PATCH /api/user/assign-admin/65f1234567890abc12345678
Headers: Authorization: Bearer <admin_token>
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "userName": "username",
      "name": { "first": "John", "last": "Doe" },
      "role": "admin"
    }
  },
  "message": "User promoted to admin successfully"
}
```

**Error Responses:**

- `400 User ID is required`
- `404 User not found`

---

## 5. PATCH /suspend/:id - Suspend/Unban User

**Functionality:** Suspends or permanently bans a user. Admin-only endpoint.

**Authentication:** Required (`verifyToken`)

**Authorization:** Admin only

**URL Parameter:**

- `id`: MongoDB ObjectId of the user to suspend/ban

**Request Body (application/json):**

```json
{
  "suspendUntil": "2026-05-01T12:00:00.000Z", // Optional: Date until suspension ends
  "suspensionReason": "Violation of terms", // Optional: Reason for suspension
  "isPermanent": false // Optional: true = permanent ban
}
```

**Request Example (Temporary Suspension):**

```
PATCH /api/user/suspend/65f1234567890abc12345678
Headers: Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "suspendUntil": "2026-06-01T00:00:00.000Z",
  "suspensionReason": "Multiple policy violations"
}
```

**Request Example (Permanent Ban):**

```
{
  "isPermanent": true,
  "suspensionReason": "Fraudulent activity"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "banned@example.com",
      "isBanned": true,
      "suspendedUntil": null,
      "banReason": "Fraudulent activity"
    }
  },
  "message": "User banned forever successfully"
}
```

**Response (200 OK - Temporary):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user_id",
      "suspendedUntil": "2026-06-01T00:00:00.000Z",
      "suspensionReason": "Multiple policy violations"
    }
  },
  "message": "User suspended until Jun 1, 2026, 12:00:00 AM"
}
```

**Error Responses:**

- `400 User ID and suspension end date (or permanent flag) are required`
- `404 User not found`

---

## 6. PATCH /review-identity/:id - Review Identity Verification

**Functionality:** Allows admins to review and approve/reject pending identity verification submissions. Admin-only.

**Authentication:** Required (`verifyToken`)

**Authorization:** Admin only

**URL Parameter:**

- `id`: MongoDB ObjectId of the user whose verification is being reviewed

**Request Body (application/json):**

```json
{
  "action": "accept" // or "decline"
}
```

**Request Example:**

```
PATCH /api/user/review-identity/65f1234567890abc12345678
Headers: Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "action": "accept"
}
```

**Response (200 OK - Accepted):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user_id",
      "identityVerification": {
        "status": "verified",
        "verifiedAt": "2026-05-01T12:30:00.000Z",
        "similarity": 0.98,
        "liveness": true
      }
    }
  },
  "message": "User identity verification has been accepted"
}
```

**Response (200 OK - Declined):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user_id",
      "identityVerification": {
        "status": "failed",
        "verifiedAt": null,
        "failReason": "Admin declined the verification"
      }
    }
  },
  "message": "User identity verification has been declined"
}
```

**Error Responses:**

- `400 User ID and action are required`
- `400 Invalid action. Must be 'accept' or 'decline'`
- `404 User not found`

---

## 7. POST /register - User Registration

**Functionality:** Creates a new user account. Sends OTP for email verification. Users can register as `user` or `worker`. Workers must select a category.

**Authentication:** Not required

**Authorization:** Public

**Request Body (application/json):**

```json
{
  "name": {
    "first": "John",
    "last": "Doe"
  },
  "userName": "john_doe",
  "dateOfBirth": "01-01-1995",
  "gender": false,
  "phoneNumber": "+201234567890",
  "email": "john@example.com",
  "password": "Pass1234",
  "confirmPassword": "Pass1234",
  "role": "user", // "user" or "worker"
  "ssn": "12345678901234", // Required for workers
  "avatar": "https://avatar.url/profile.jpg", // Optional
  "address": {
    "government": "Cairo",
    "city": "Cairo",
    "street": "123 Main St"
  },
  "categoryId": "65f1234567890abc12345678" // Required if role is "worker"
}
```

**Validation Rules (`registerSchema`):**

- `name.first`: Required, 2-32 chars, string
- `name.last`: Required, 2-32 chars, string
- `userName`: Required, 5-32 chars, alphanumeric/underscore only
- `dateOfBirth`: Required, DD-MM-YYYY format, age 18-120, not future date
- `gender`: Required, boolean (false=male, true=female)
- `phoneNumber`: Required, 5-32 chars, valid Egyptian mobile
- `email`: Required, 5-100 chars, valid email, no disposable domains
- `password`: Required, 8-100 chars, min 1 uppercase, 1 lowercase, 1 number
- `confirmPassword`: Required, must match password
- `role`: Optional, one of: `user`, `worker`, `admin`
- `avatar`: Optional, URL string
- `ssn`: Required, exactly 14 numeric digits
- `address.*`: Optional strings
- `categoryId`: Required for workers, optional for users (must be valid Category ID)

**Request Example:**

```
POST /api/user/register
Content-Type: application/json

{
  "name": { "first": "John", "last": "Doe" },
  "userName": "john_doe",
  "dateOfBirth": "01-01-1995",
  "gender": false,
  "phoneNumber": "+201234567890",
  "email": "john@example.com",
  "password": "Pass1234",
  "confirmPassword": "Pass1234",
  "role": "user",
  "ssn": "12345678901234"
}
```

**Response (201 Created):**

```json
{
  "status": "success",
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "_id": "new_user_id",
      "email": "john@example.com",
      "userName": "john_doe",
      "role": "user"
    },
    "token": "jwt_token_expiring_in_30m"
  }
}
```

**Error Responses:**

- `400 Validation failed` (with array of validation errors)
- `400 Registration failed. Email is already in use.`
- `400 Registration failed. Phone Number is already in use.`
- `400 Registration failed. User Name is already in use.`
- `400 Registration failed. SSN is already in use.`

---

## 8. POST /login - User Login

**Functionality:** Authenticates user with email and password. Returns JWT token and user profile. Generates 30-minute token. Checks for bans/suspensions.

**Authentication:** Not required

**Authorization:** Public

**Request Body (application/json):**

```json
{
  "email": "john@example.com",
  "password": "Pass1234"
}
```

**Validation Rules (`loginSchema`):**

- `email`: Required, valid format, 5-100 chars
- `password`: Required, 8-100 chars, string

**Request Example:**

```
POST /api/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Pass1234"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "successfully signed",
  "token": "jwt_token_expiring_in_30m",
  "user": {
    "_id": "user_id",
    "email": "john@example.com",
    "userName": "john_doe",
    "name": {
      "first": "John",
      "last": "Doe"
    },
    "role": "user",
    "avatar": "avatar_url"
  }
}
```

**Error Responses:**

- `400 Validation Error`
- `401 Invalid email or password`
- `403 Your account is permanently banned. Reason: ...`
- `403 Your account is suspended until ... Reason: ...`

---

## 9. POST /logout - User Logout

**Functionality:** Logs out the current user by blacklisting their JWT token (jti). Invalidates the session.

**Authentication:** Required (`verifyToken`)

**Authorization:** Any authenticated user

**Request Example:**

```
POST /api/user/logout
Headers: Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "_id": "blacklisted_token_id",
    "tokenId": "jti_from_token",
    "expiresAt": "2026-05-01T13:00:00.000Z"
  },
  "message": "logged out successfully"
}
```

---

## 10. POST /confirmEmail - Confirm Email OTP

**Functionality:** Verifies the email using the OTP sent during registration.

**Authentication:** Required (`verifyToken`)

**Authorization:** Any authenticated user (who registered but not yet verified)

**Request Body (application/json):**

```json
{
  "otp": "123456"
}
```

**Validation Rules (`confirmEmailSchema`):**

- `otp`: Required, exactly 6 digits, numeric only

**Request Example:**

```
POST /api/user/confirmEmail
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "otp": "123456"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Your email has been verified successfully"
}
```

**Error Responses:**

- `400 Validation Error`
- `400 Email is already verified`
- `400 OTP has expired. Please request a new one`
- `400 Invalid OTP type`
- `401 Invalid OTP`
- `404 User not found`

---

## 11. POST /resend-confirmation-otp - Resend Verification OTP

**Functionality:** Sends a new email verification OTP. Rate-limited to 1 request per minute.

**Authentication:** Required (`verifyToken`)

**Authorization:** Authenticated user with unverified email

**Request Example:**

```
POST /api/user/resend-confirmation-otp
Headers: Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "A new verification OTP has been sent to your email."
}
```

**Error Responses:**

- `400 Email is already verified`
- `429 Please wait X seconds before requesting a new OTP.`
- `404 User not found`

---

## 12. POST /complete-profile - Complete User Profile

**Functionality:** Completes user profile after OAuth login (Google) or partial registration. Adds phone number and SSN. These are required to use the platform fully.

**Authentication:** Required (`verifyToken`)

**Authorization:** Any authenticated user

**Request Body (application/json):**

```json
{
  "phoneNumber": "+201234567890",
  "ssn": "12345678901234"
}
```

**Validation:**

- `phoneNumber`: Required, valid Egyptian mobile, unique (not in use by another account)
- `ssn`: Required, exactly 14 digits, unique (not in use by another account)

**Request Example:**

```
POST /api/user/complete-profile
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "+201234567890",
  "ssn": "12345678901234"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Profile completed successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "userName": "username",
      "name": { "first": "John", "last": "Doe" },
      "email": "john@example.com",
      "phoneNumber": "+201234567890",
      "ssn": "12345678901234",
      "avatar": "avatar_url",
      "role": "user"
    }
  }
}
```

**Error Responses:**

- `400 Phone number is required`
- `400 Phone number is already in use`
- `400 SSN is already in use`
- `404 User not found`

---

## 13. POST /google-login - Google OAuth Login

**Functionality:** Authenticates user via Google OAuth token. Creates new user if Google account doesn't exist. Returns JWT and profile.

**Authentication:** Not required

**Authorization:** Public

**Request Body (application/json):**

```json
{
  "token": "google_oauth_id_token"
}
```

**Request Example:**

```
POST /api/user/google-login
Content-Type: application/json

{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2Mj..."
}
```

**Response (200 OK):**

```json
{
  "message": "Login successful",
  "token": "jwt_token_30d_expiry",
  "needsPhoneNumber": true, // true if user needs to add phone number
  "needsSSn": true, // true if user needs to add SSN
  "user": {
    "id": "user_id",
    "userName": "john_doe_1234",
    "name": { "first": "John", "last": "Doe" },
    "email": "john@gmail.com",
    "phoneNumber": null,
    "avatar": "https://google-avatar.url/...",
    "role": "user"
  }
}
```

**Error Responses:**

- `400 Google token is required`
- `500 OAuth verification failed` (if Google token invalid)

---

## 14. POST /verify-identity - Identity Verification (Face Verification)

**Functionality:** Submits ID image and live selfie for AI-powered identity verification. Sends images to Python face recognition API at `PYTHON_API_URL`. Sets status to `verified`, `pending` (close match), or `failed`.

**Authentication:** Required (`verifyToken`)

**Authorization:** Any authenticated user

**Request Headers:**

- `Content-Type: multipart/form-data`

**Form Data Fields:**

- `id_image` (file, required): Image of government ID card
- `live_image` (file, required): Live selfie/photo

**Request Example:**

```
POST /api/user/verify-identity
Headers: Authorization: Bearer <token>
Body:
  id_image: [ID card photo]
  live_image: [selfie photo]
```

**Response (200 OK - Verified):**

```json
{
  "status": "success",
  "match": true,
  "details": {
    "faceMatch": true,
    "liveness": true,
    "similarity": 0.98,
    "confidence": "high",
    "threshold": 0.85,
    "timings": {
      "face_detection": 150,
      "face_match": 200,
      "liveness_check": 100
    }
  }
}
```

**Response (200 OK - Pending Review):**

```json
{
  "status": "success",
  "match": false,
  "details": {
    "faceMatch": false,
    "liveness": true,
    "similarity": 0.82,
    "confidence": "medium",
    "threshold": 0.85,
    "timings": { ... }
  }
}
```

**User `identityVerification` field updates:**

```javascript
{
  status: "verified" | "pending" | "failed",
  similarity: 0.82,
  liveness: true,
  confidence: "high",
  verifiedAt: Date or null,
  failReason: null or "Face mismatch (similarity: 0.82)" or "Pending admin review..."
}
```

**Error Responses:**

- `400 Images required`
- `400 Both id_image and live_image are required`
- `503 AI verification service is not running. Please start the Python service on port 5000.`
- `504 AI verification service timed out.`
- `503 Verification Service Error: ...` (other Python API errors)

---

## 15. POST /upload - Upload Profile Image

**Functionality:** Uploads a profile avatar image to Cloudinary and updates user's avatar field.

**Authentication:** Required (`verifyToken`)

**Authorization:** Any authenticated user

**Request Headers:**

- `Content-Type: multipart/form-data`

**Form Data Fields:**

- `file` (file, required): Image file (JPEG, PNG, etc.)

**Request Example:**

```
POST /api/user/upload
Headers: Authorization: Bearer <token>
Body:
  file: profile_picture.jpg
```

**Response (200 OK):**

```json
{
  "message": "Profile image updated successfully",
  "file": {
    "_id": "user_id",
    "avatar": "https://res.cloudinary.com/.../profile_picture.jpg",
    "userName": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**

- `400 No file uploaded`

---

## 16. POST /forgotPassword - Forgot Password Request

**Functionality:** Initiates password reset by generating OTP and sending to user's email. Rate-limited to 1 request per minute per user. Only sends email if user exists AND email is verified.

**Authentication:** Not required

**Authorization:** Public

**Request Body (application/json):**

```json
{
  "email": "john@example.com"
}
```

**Validation Rules (`forgotPasswordSchema`):**

- `email`: Required, valid email format

**Request Example:**

```
POST /api/user/forgotPassword
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response (200 OK - Email exists & verified):**

```json
{
  "status": "success",
  "message": "Reset OTP has been sent to your email"
}
```

**Response (200 OK - Email not found or unverified - security):**

```json
{
  "status": "success",
  "message": "If the email exists and is verified, a reset OTP has been sent"
}
```

**Error Responses:**

- `400 Validation Error`
- `403 Please verify your email before requesting a password reset`
- `429 Password reset requested too soon. Please wait X seconds.`
- `500 An error occurred while processing your request`

---

## 17. POST /resend-resetpassword-otp - Resend Reset Password OTP

**Functionality:** Resends password reset OTP. Rate-limited to 1 request per minute.

**Authentication:** Not required

**Authorization:** Public

**Request Body (application/json):**

```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "New reset OTP has been sent to your email."
}
```

**Error Responses:**

- `400 Validation Error`
- `403 Please verify your email before requesting a password reset`
- `429 Please wait X seconds before requesting a new OTP.`

---

## 18. POST /resetPassword - Reset Password with OTP

**Functionality:** Completes password reset by validating OTP and setting new password.

**Authentication:** Not required

**Authorization:** Public

**Request Body (application/json):**

```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewPass1234"
}
```

**Validation Rules (`resetPasswordSchema`):**

- `email`: Required, valid email
- `otp`: Required, 6 digits, numeric
- `newPassword`: Required, 8-100 chars, 1 uppercase, 1 lowercase, 1 number

**Request Example:**

```
POST /api/user/resetPassword
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewPass1234"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Password reset successfully"
}
```

**Error Responses:**

- `400 Validation Error`
- `400 Email, OTP and new password are required`
- `400 OTP is invalid or expired`
- `404 User not found`

---

## User Model Fields

| Field                             | Type                | Required                  | Encrypted | Notes                                                   |
| --------------------------------- | ------------------- | ------------------------- | --------- | ------------------------------------------------------- |
| `_id`                             | ObjectId            | Auto                      | No        | Unique identifier                                       |
| `name.first`                      | String              | Conditional               | **Yes**   | First name (2-32 chars)                                 |
| `name.last`                       | String              | Conditional               | **Yes**   | Last name (2-32 chars)                                  |
| `userName`                        | String              | Yes                       | **Yes**   | Unique username (5-32 chars, alphanumeric+underscore)   |
| `dateOfBirth`                     | String (DD-MM-YYYY) | Yes (register)            | **Yes**   | Date of birth string                                    |
| `gender`                          | Boolean             | Yes (register)            | No        | false=male, true=female                                 |
| `email`                           | String              | Yes                       | **Yes**   | Unique, verified email                                  |
| `password`                        | String              | Yes (register)            | No        | bcrypt hashed, select: false                            |
| `phoneNumber`                     | String              | No                        | **Yes**   | Unique, sparse, Egyptian mobile                         |
| `role`                            | String              | Yes                       | No        | `user`, `worker`, `admin`, `customer` (default: `user`) |
| `avatar`                          | String              | No                        | No        | Profile image URL (Cloudinary)                          |
| `rating`                          | Number              | No                        | No        | 1-5 scale, default: 5                                   |
| `ssn`                             | String              | No (required for workers) | **Yes**   | Unique 14-digit SSN, sparse, select: false              |
| `address.government`              | String              | No                        | **Yes**   | Governorate                                             |
| `address.city`                    | String              | No                        | **Yes**   | City                                                    |
| `address.street`                  | String              | No                        | **Yes**   | Street address                                          |
| `locationCoords.lat`              | Number              | No                        | No        | Latitude                                                |
| `locationCoords.lng`              | Number              | No                        | No        | Longitude                                               |
| `otp.value`                       | String              | No                        | No        | OTP hash, select: false                                 |
| `otp.createdAt`                   | Date                | No                        | No        | select: false                                           |
| `otp.expiresAt`                   | Date                | No                        | No        | select: false                                           |
| `otp.otpType`                     | String              | No                        | No        | `confirm` or `resetPassword`                            |
| `verifiedAt`                      | Date                | No                        | No        | Email verification timestamp                            |
| `resetPassword.value`             | String              | No                        | No        | Reset OTP hash                                          |
| `resetPassword.createdAt`         | Date                | No                        | No        |                                                         |
| `resetPassword.expiresAt`         | Date                | No                        | No        |                                                         |
| `resetPassword.otpType`           | String              | No                        | No        | `confirm` or `resetPassword`                            |
| `deletedAt`                       | Date                | No                        | No        | Soft delete timestamp                                   |
| `restoreUntil`                    | Date                | No                        | No        | For temporary deletion                                  |
| `deleted`                         | Boolean             | No                        | No        | Soft delete flag                                        |
| `googleId`                        | String              | No                        | No        | Unique sparse, select: false                            |
| `identityVerification.status`     | String              | No                        | No        | `unverified`, `pending`, `verified`, `failed`           |
| `identityVerification.similarity` | Number              | No                        | No        | Face match similarity score                             |
| `identityVerification.confidence` | String              | No                        | No        | Confidence level                                        |
| `identityVerification.liveness`   | Boolean             | No                        | No        | Liveness check result                                   |
| `identityVerification.verifiedAt` | Date                | No                        | No        | When verified                                           |
| `identityVerification.failReason` | String              | No                        | No        | Why verification failed                                 |
| `categoryId`                      | ObjectId            | No                        | No        | Reference to Category (workers only)                    |
| `suspendedUntil`                  | Date                | No                        | No        | Suspension expiry                                       |
| `suspensionReason`                | String              | No                        | No        | Reason for suspension                                   |
| `isBanned`                        | Boolean             | No                        | No        | Permanent ban flag                                      |
| `bannedAt`                        | Date                | No                        | No        | Ban timestamp                                           |
| `banReason`                       | String              | No                        | No        | Ban reason                                              |
| `createdAt`                       | Date                | Auto                      | No        | Timestamp                                               |
| `updatedAt`                       | Date                | Auto                      | No        | Timestamp                                               |

**Encryption Note:** Sensitive fields (name, userName, dateOfBirth, email, phoneNumber, address, ssn) are encrypted at rest using AES via `src/Utils/Encrypt/crypt.js`.

---

## Roles Enum

Located in `src/Utils/enums/usersRoles.js`:

```javascript
export const Roles = {
  user: "user", // Regular customer
  worker: "worker", // Service provider
  admin: "admin", // Platform admin
};
// Note: "customer" maps to "user" role
```

---

## OTP Types Enum

```javascript
export const OtpTypesEnum = {
  CONFIRMATION: "confirm",
  RESETPASSWORD: "resetPassword",
};
```

---

## Middleware Chain

### Protected Routes (require `verifyToken`)

1. **verifyToken** (`src/Middlewares/verifytoken.js`)
   - Extracts JWT from `Authorization: Bearer <token>`
   - Verifies token signature
   - Checks blacklist (deleted sessions)
   - Checks user exists in DB
   - Checks user not deleted, not suspended, not banned
   - Attaches `req.currentUser` with full user object
   - Attaches `req.currentUser.jti` for blacklisting
   - Attaches `req.currentUser.role` for authorization

2. **allowedTo(...roles)** (`src/Middlewares/allowedTo.js`)
   - Checks if user has required role
   - For `:id` routes: also checks resource ownership (`req.params.id` matches `req.currentUser._id`)
   - Admin bypasses ownership check

### Admin-Only Routes

Routes with `allowedTo(Roles.admin)`:

- `GET /` (allUsers)
- `PATCH /:id` (editUser)
- `PATCH /assign-admin/:id`
- `PATCH /suspend/:id`
- `PATCH /review-identity/:id`

### Validation Middleware

- **`normalizeAuthFields`** (`src/Middlewares/normalizeInput.js`)
  - Trims strings
  - Lowercases email
  - Removes non-numeric from phone
  - Applied to: `/register`, `/login`, `/forgotPassword`, `/resend-resetpassword-otp`, `/resetPassword`

- **`checkSchema(...)`** with express-validator schemas:
  - `registerSchema` → `/register`
  - `loginSchema` → `/login`
  - `forgotPasswordSchema` → `/forgotPassword`, `/resend-resetpassword-otp`
  - `resetPasswordSchema` → `/resetPassword`

### File Upload Middleware

- **memoryFileUpload().fields([...])** on `/verify-identity`
  - Uploads `id_image` (1 file) and `live_image` (1 file) to memory
  - Then sent via axios to Python AI verification API

- **localFileUpload({ customPath: "user" }).single("file")** on `/upload`
  - Uploads single file to local filesystem
  - Then uploads to Cloudinary
  - Deletes local temp file after upload

---

## Error Response Format

Standardized error JSON:

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "data": null,
  "details": [
    /* validation errors array */
  ]
}
```

HTTP Status Codes used:

- `200` - Success (GET, PATCH, DELETE, POST verification)
- `201` - Created (register, offer, task)
- `400` - Bad request, validation, business logic
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions, banned/suspended)
- `404` - Not found
- `429` - Too Many Requests (rate limit/cooldown)
- `500` - Server error
- `503` - Service unavailable (Python AI API down)
- `504` - Gateway timeout (Python AI API timeout)

---

## Notes

- Base path mounted at `/api/user` in `src/app.js:20`
- Sensitive fields encrypted: name, userName, dateOfBirth, email, phoneNumber, address fields, SSN
- JWT token expiry:
  - Registration/Login: 30 minutes (`30m`)
  - Google login: 30 days (`30d`)
- Password hashing: bcrypt with 12 rounds
- OTP: 6-digit numeric, expires in 10 minutes
- Rate limiting on OTP resend: 60 seconds cooldown
- Email verification required for password reset
- Identity verification requires Python AI service running on `PYTHON_API_URL` (default: `http://localhost:5000`)
- User soft delete supported (`deleted` flag, `deletedAt`, `restoreUntil`)
- Identity verification statuses: `unverified`, `pending` (close face match but not quite), `verified`, `failed`
- `googleId` field allows linking Google accounts
- Workers must have `categoryId` set to valid Category ID
- Clouds: Profile images to `FixPay/users/{userId}`; ID verification images uploaded to Python API, not stored in Cloudinary

---

## Google OAuth Flow

1. Frontend obtains Google ID token via Google Sign-In SDK
2. Sends token to `/api/user/google-login`
3. Backend verifies token with Google using `GOOGLE_WEB_CLIENT_ID`
4. If user exists with that email:
   - Updates `googleId` if not set
   - Updates `avatar` if missing
   - Sets `verifiedAt` if email verified by Google
   - Returns existing user data + new JWT
5. If user doesn't exist:
   - Creates new user with Google data
   - `userName` generated as `email.split('@')[0] + random_4_digits`
   - `role` defaults to `user`
   - Returns new user data + JWT
6. `needsPhoneNumber` and `needsSSn` flags indicate incomplete profile
7. Frontend should navigate to profile completion if either flag is true

---

## OTP Cooldown Logic

OTP resend is rate-limited:

```javascript
const COOLDOWN_MS = 60 * 1000; // 1 minute

// Check: if (user.otp.createdAt && user.otp.expiresAt > Date.now()) {
//   timeSince = Date.now() - user.otp.createdAt
//   if (timeSince < COOLDOWN_MS) reject with wait time
// }
```

Applicable to:

- Resend confirmation OTP (`/resend-confirmation-otp`)
- Resend reset password OTP (`/resend-resetpassword-otp`)

---

## Identity Verification Flow

1. User calls `/api/user/verify-identity` with `id_image` (ID card) and `live_image` (selfie) files
2. Backend sends both images to Python AI API at `POST /verify` (configured via `PYTHON_API_URL`)
3. Python API performs:
   - Face detection (both images)
   - Face matching (ID face vs selfie)
   - Liveness detection (ensures selfie is real person, not photo/attack)
   - Returns: `{ match: bool, similarity: float, liveness: bool, confidence: string, threshold: float, timings: {...} }`
4. Backend updates user's `identityVerification` field:
   - If `match && liveness` → `status: "verified"`, set `verifiedAt`
   - If `liveness` but not match, and similarity near threshold (within 10%) → `status: "pending"` (requires admin review)
   - Else → `status: "failed"` with `failReason`
5. Response includes detailed results
6. Admin can review pending cases via `/review-identity/:id` with `action: "accept" | "decline"`

---

## Password Reset Flow

1. User requests reset at `/forgotPassword` with email
2. System checks:
   - User exists
   - Email is verified (`verifiedAt` exists)
   - Cooldown (60s since last request)
3. Generates 6-digit OTP, stores hashed in `resetPassword` subdocument
4. Sends OTP via email
5. User submits OTP + new password at `/resetPassword`
6. System validates:
   - OTP matches hash
   - OTP not expired (10 min)
   - OTP type is `resetPassword`
7. Hashes new password with bcrypt (12 rounds), saves
8. Clears reset OTP from user record

---

## Email Verification Flow

1. Registration creates user with unverified email
2. Generates 6-digit OTP, stores hashed in `otp` subdocument (`otpType: "confirm"`)
3. Sends OTP via email to `user.email`
4. User submits OTP at `/confirmEmail`
5. Validates OTP against hash and expiry
6. Sets `verifiedAt = Date.now()`, clears `otp` field
7. Email now marked as verified

---

## Soft Deletion & Account Recovery

- `deleted: true` + `deletedAt` marks account as soft-deleted
- `restoreUntil` allows temporary deletion with auto-restore
- `verifyToken` middleware rejects deleted accounts (401)
- Admins can view and potentially restore deleted accounts via DB

---

## Suspension & Banning

**Temporary Suspension:**

- `suspendedUntil` + `suspensionReason` set
- User can't log in until `suspendedUntil` passes
- Error: "Account suspended until {date}. Reason: ..."

**Permanent Ban:**

- `isBanned: true` + `banReason` set
- `bannedAt` timestamp
- User permanently blocked
- Error: "Your account has been permanently banned. Reason: ..."

Both checked in `verifyToken` middleware before allowing login/operations.

---

MY TESTS
register
