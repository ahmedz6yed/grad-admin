# Upload Feature Documentation

## Base URL

`http://localhost:3000/api/user`

---

## 1. POST /upload - Upload User Profile Image

**Functionality:** Uploads a profile image for the authenticated user and stores the avatar URL on the user record.

**Authentication:** Required (`verifyToken`)

**Authorization:** Any authenticated user

**Request Type:** `multipart/form-data`

**Form Field:**
- `file` - the image file to upload

**Request Headers:**
- `Authorization: Bearer <token>`

**Behavior:**
- The route uses `req.currentUser._id` from the token payload.
- Uploaded file is handled by `localFileUpload({ customPath: "user" }).single("file")`.
- File is uploaded to Cloudinary under `FixPay/users/<userId>`.
- The user's `avatar` field is updated with the Cloudinary `secure_url`.

**Request Example:**

```bash
curl -X POST "http://localhost:3000/api/user/upload" \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/avatar.jpg"
```

**Response (200 OK):**

```json
{
  "message": "Profile image updated successfully",
  "file": {
    "_id": "user_id",
    "avatar": "https://res.cloudinary.com/.../avatar.jpg",
    "name": {
      "first": "John",
      "last": "Doe"
    },
    "email": "john@example.com",
    "role": "user",
    "updatedAt": "2026-05-01T12:00:00.000Z"
  }
}
```

**Error Responses:**

- `400 No file uploaded` if the `file` field is missing.
- `401 Unauthorized` if the token is missing or invalid.
- `500 Internal Server Error` for upload or database failures.

**Notes:**
- This endpoint updates the current user's own profile image only.
- If the file upload fails, the user record is not updated.
