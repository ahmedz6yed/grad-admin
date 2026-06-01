# Edit User Feature Documentation

## Base URL

`http://localhost:3000/api/user`

---

## PATCH /:id - Edit User

**Route location:** `src/Routes/User.Router.js`

**Functionality:**
Allows an admin to update a user's profile fields by user ID.

**Authentication:** Required (`verifyToken`)

**Authorization:** Admin only (`allowedTo(Roles.admin)`)

**Validation:** `checkSchema(editUserSchema)` from `src/Middlewares/validationSchema.js`

**URL Parameter:**

- `id` - the MongoDB ObjectId of the user to update

**Request Body:**
A JSON object containing any editable user fields. All fields are optional.

Common fields:

- `name.first` (string)
- `name.last` (string)
- `userName` (string)
- `dateOfBirth` (string, DD-MM-YYYY)
- `gender` (`0`, `1`, `male`, `female`, `true`, `false`)
- `phoneNumber` (Egyptian mobile number)
- `email` (string)
- `avatar` (string URL)
- `ssn` (string)
- `address.government` (string)
- `address.city` (string)
- `address.street` (string)
- `categoryId` (MongoDB ObjectId, only for workers)

**Request Example:**

```bash
curl -X PATCH "http://localhost:3000/api/user/65f1234567890abc12345678" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": { "first": "Sarah", "last": "Khan" },
    "phoneNumber": "+201234567890",
    "role": "worker",
    "categoryId": "65f1234567890abc12345679"
  }'
```

**How it works:**

- The route is defined in `src/Routes/User.Router.js`.
- The request passes through token verification (`verifyToken`) and admin authorization (`allowedTo(Roles.admin)`).
- The request body is validated using `editUserSchema`.
- The controller `editUser` updates the user record and returns the updated document.

**Response:**

- `200 OK` with the updated user object when successful.
- `400 Bad Request` if validation fails or required data is missing.
- `404 Not Found` if the user ID does not exist.

**Success Response Example:**

```json
{
  "status": "success",
  "data": {
    "_id": "65f1234567890abc12345678",
    "name": { "first": "Sarah", "last": "Khan" },
    "userName": "sarah_khan",
    "email": "sarah@example.com",
    "phoneNumber": "+201234567890",
    "role": "worker",
    "categoryId": "65f1234567890abc12345679",
    "updatedAt": "2026-05-14T12:34:56.000Z"
  }
}
```

**Notes:**

- This endpoint updates the specified user by ID, but only admins can call it.
- Use this route for admin-managed profile updates such as role changes or category assignment.
