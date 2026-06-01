# Task Feature Documentation

## Base URL
`http://localhost:3000/api/tasks`

---

## 1. GET /open - Get All Open Tasks

**Functionality:** Retrieves all tasks with status "open" (available for workers to bid on). Supports pagination.

**Authentication:** Required (`verifyToken` middleware)

**Authorization:** All authenticated users (customers, workers, admins)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Request Example:**
```
GET /api/tasks/open?page=1&limit=10
Headers: Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "tasks": [
      {
        "_id": "task_id",
        "title": "Encrypted or decrypted title",
        "description": "Encrypted or decrypted description",
        "budget": 500,
        "location": "Cairo, Egypt",
        "locationCoords": {
          "lat": 30.0444,
          "lng": 31.2357
        },
        "status": "open",
        "images": ["url1", "url2"],
        "categoryId": {
          "_id": "category_id",
          "name": "Cleaning"
        },
        "customerId": {
          "_id": "customer_id",
          "userName": "john_doe",
          "name": "John Doe",
          "avatar": "avatar_url"
        },
        "createdAt": "2026-05-01T10:00:00.000Z",
        "updatedAt": "2026-05-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "totalTasks": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

## 2. GET /:taskId/offers - Get Task Offers

**Functionality:** Retrieves all offers submitted for a specific task. Used by customers to see who bid on their task.

**Authentication:** Required (`verifyToken`)

**Authorization:** Only the task owner (customer) or admin

**URL Parameter:**
- `taskId`: MongoDB ObjectId of the task

**Request Example:**
```
GET /api/tasks/65f1234567890abc12345678/offers
Headers: Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "offers": [
      {
        "_id": "offer_id",
        "taskId": "task_id",
        "workerId": {
          "_id": "worker_id",
          "userName": "worker_name",
          "name": "Worker Name",
          "avatar": "avatar_url",
          "rating": 4.5
        },
        "price": 450,
        "message": "I can do this job",
        "estimatedTime": 30,
        "estimatedDistance": 5.2,
        "status": "pending",
        "negotiationHistory": [],
        "createdAt": "2026-05-01T10:30:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**
- `404 Task not found`
- `403 Not authorized to view these offers`

---

## 3. POST / - Create Task

**Functionality:** Creates a new task. Only customers can create tasks. Images are uploaded to Cloudinary.

**Authentication:** Required (`verifyToken`)

**Authorization:** Only customers (`Roles.customer`)

**Request Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data Fields:**
- `title` (string, 5-100 chars): Task title (encrypted in DB)
- `description` (string, min 10 chars): Task description (encrypted in DB)
- `categoryId` (string, MongoDB ObjectId): Category reference
- `budget` (number, > 0): Task budget
- `location` (string): Task location (encrypted in DB)
- `locationCoords` (object): Optional GPS coordinates `{ lat: number, lng: number }`
- `images` (files, max 5): Image files (JPEG, PNG, etc.)

**Request Example (multipart/form-data):**
```
POST /api/tasks/
Headers: Authorization: Bearer <token>
Body:
  title: "Fix leaking kitchen pipe"
  description: "The kitchen sink pipe is leaking and needs repair"
  categoryId: "65f1234567890abc12345678"
  budget: 500
  location: "123 Main St, Cairo"
  locationCoords: { "lat": 30.0444, "lng": 31.2357 }
  images: [file1.jpg, file2.jpg]
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "task": {
      "_id": "new_task_id",
      "customerId": "customer_id",
      "title": "Fix leaking kitchen pipe",
      "description": "The kitchen sink pipe is leaking and needs repair",
      "categoryId": "category_id",
      "budget": 500,
      "location": "123 Main St, Cairo",
      "locationCoords": {
        "lat": 30.0444,
        "lng": 31.2357
      },
      "status": "open",
      "images": ["https://res.cloudinary.com/.../image1.jpg", "https://res.cloudinary.com/.../image2.jpg"],
      "createdAt": "2026-05-01T10:00:00.000Z",
      "updatedAt": "2026-05-01T10:00:00.000Z"
    }
  }
}
```

**Validation Errors (400):**
```json
{
  "status": "error",
  "message": "Validation Error",
  "data": [
    {
      "type": "field",
      "value": "short",
      "msg": "Title must be at least 5 characters",
      "path": "title",
      "location": "body"
    }
  ]
}
```

**Validation Rules (`taskValidationSchema`):**
- `title`: Required, 5-100 characters
- `description`: Required, min 10 characters
- `categoryId`: Required, valid MongoDB ObjectId
- `budget`: Required, positive number
- `location`: Required

---

## 4. PATCH /:taskId - Update Task

**Functionality:** Updates an existing task. Customers can only edit their own tasks. Admins can edit any task. New images are appended to existing images array.

**Authentication:** Required (`verifyToken`)

**Authorization:** Task owner (customer) or admin

**URL Parameter:**
- `taskId`: MongoDB ObjectId of the task to update

**Request Headers:**
- `Authorization: Bearer <token>`
- `Content-Type`: multipart/form-data (if uploading images) or application/json

**Form Data Fields (all optional):**
- `title` (string): Updated title
- `description` (string): Updated description
- `categoryId` (string): Updated category
- `budget` (number): Updated budget
- `location` (string): Updated location
- `locationCoords` (object): Updated GPS coordinates `{ lat, lng }`
- `images` (files, max 5): New images to add

**Request Example:**
```
PATCH /api/tasks/65f1234567890abc12345678
Headers: Authorization: Bearer <token>
Body:
  title: "Updated task title"
  budget: 600
  images: [new_image1.jpg]
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "task": {
      "_id": "task_id",
      "customerId": "customer_id",
      "title": "Updated task title",
      "description": "Original or updated description",
      "categoryId": "category_id",
      "budget": 600,
      "location": "Updated or original location",
      "locationCoords": { "lat": 30.0444, "lng": 31.2357 },
      "status": "open",
      "images": ["existing_url1", "existing_url2", "new_image_url"],
      "createdAt": "2026-05-01T10:00:00.000Z",
      "updatedAt": "2026-05-01T11:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `404 Task not found`
- `403 You are not authorized to edit this task`

---

## 5. DELETE /:taskId - Delete Task

**Functionality:** Deletes a task. Only the task owner (customer) or an admin can delete.

**Authentication:** Required (`verifyToken`)

**Authorization:** Task owner (customer) or admin

**URL Parameter:**
- `taskId`: MongoDB ObjectId of the task to delete

**Request Example:**
```
DELETE /api/tasks/65f1234567890abc12345678
Headers: Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": null,
  "message": "Task deleted successfully"
}
```

**Error Responses:**
- `404 Task not found`
- `403 You are not authorized to delete this task`

---

## Task Model Fields

| Field | Type | Required | Encrypted | Description |
|-------|------|----------|-----------|-------------|
| `_id` | ObjectId | Auto | No | Unique identifier |
| `customerId` | ObjectId | Yes | No | Reference to Users collection |
| `workerId` | ObjectId | No | No | Reference to assigned worker (Users) |
| `title` | String | Yes | **Yes** | Task title (5-100 chars) |
| `description` | String | Yes | **Yes** | Detailed task description (min 10 chars) |
| `categoryId` | ObjectId | Yes | No | Reference to Category collection |
| `budget` | Number | Yes | No | Positive number |
| `location` | String | Yes | **Yes** | Physical location |
| `locationCoords` | Object | No | No | `{ lat: Number, lng: Number }` |
| `status` | String | No | No | One of: `open`, `assigned`, `in-progress`, `completed`, `cancelled` |
| `images` | [String] | No | No | Array of Cloudinary image URLs |
| `createdAt` | Date | Auto | No | Timestamp |
| `updatedAt` | Date | Auto | No | Timestamp |

**Encryption Note:** Fields marked as encrypted use AES encryption via `src/Utils/Encrypt/crypt.js` - stored encrypted in DB, decrypted on retrieval.

---

## Task Status Enum

Located in `src/Utils/enums/taskStatus.js`:

```javascript
export const TaskStatus = {
  OPEN: "open",           // Task is available for offers
  ASSIGNED: "assigned",   // Worker accepted, tracking may start
  IN_PROGRESS: "in-progress", // Work in progress
  COMPLETED: "completed", // Task finished
  CANCELLED: "cancelled"  // Task cancelled by customer/admin
};
```

---

## Middleware Chain

All routes (except where noted) use:

1. **verifyToken** (`src/Middlewares/verifytoken.js`)
   - Validates JWT from `Authorization: Bearer <token>`
   - Checks token blacklist
   - Verifies user exists, not deleted, not suspended, not banned
   - Attaches `req.currentUser` with user data

2. **allowedTo(...roles)** (`src/Middlewares/allowedTo.js`)
   - Role-based authorization
   - For `:taskId` routes: also checks ownership (customer who created the task)
   - Admin role bypasses ownership check

3. **memoryFileUpload().array("images", 5)** (for create/update)
   - Uses `multer` with memory storage
   - Accepts up to 5 image files
   - Filename field: `images[]`

4. **taskValidationSchema** (for POST only)
   - `express-validator` chain
   - Validates title, description, categoryId, budget, location

---

## Error Response Format

Standardized error responses use `AppError`:

```json
{
  "status": "error",
  "message": "Error description",
  "data": null,
  "details": [ /* validation errors array */ ]
}
```

HTTP status codes:
- `400` - Validation error, business logic violation
- `401` - Missing/invalid token
- `403` - Authorization denied
- `404` - Resource not found
- `500` - Server error

---

## Notes

- Base path mounted at `/api/tasks` in `src/app.js:22`
- Task title, description, and location are encrypted at rest (AES)
- Images are uploaded to Cloudinary folder: `FixPay/users/{customerId}/tasks/{taskId}-{index}`
- Pagination is query-based (`page`, `limit`)
- The `getTaskOffers` controller is imported from Offer module (`src/Modules/Offer/offer.controller.js:202`)
- When an offer is accepted via Offer controller, Task status changes to `assigned` and `workerId` is set
