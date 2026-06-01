# Category Feature Documentation

## Base URL
`http://localhost:3000/api/categories`

---

## Overview

The Category API manages service categories (e.g., "Cleaning", "Plumbing", "Electric"). Categories classify tasks and workers. Workers choose a category they specialize in; tasks are created within a category. All endpoints require authentication.

---

## Category Model Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `_id` | ObjectId | Auto | - | Unique identifier |
| `name` | String | Yes | Unique, 2-50 chars | Category name (e.g., "Cleaning", "Plumbing") |
| `createdAt` | Date | Auto | - | When category was created |
| `updatedAt` | Date | Auto | - | Last updated timestamp |

**Indexes:**
- `name` has a unique index (duplicate category names rejected)

---

## 1. GET / - Get All Categories

**Functionality:** Retrieves all available categories. Used to populate category dropdowns in task creation, worker profile setup, and filtering.

**Authentication:** Required (`verifyToken`)

**Authorization:** Any authenticated user (customers, workers, admins)

**Query Parameters:** None

**Request Example:**
```
GET /api/categories
Headers: Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "categories": [
      {
        "_id": "65f1234567890abc12345678",
        "name": "Cleaning",
        "createdAt": "2026-05-01T10:00:00.000Z",
        "updatedAt": "2026-05-01T10:00:00.000Z"
      },
      {
        "_id": "65f1234567890abc12345679",
        "name": "Plumbing",
        "createdAt": "2026-05-01T11:00:00.000Z",
        "updatedAt": "2026-05-01T11:00:00.000Z"
      },
      {
        "_id": "65f1234567890abc12345680",
        "name": "Electrical",
        "createdAt": "2026-05-01T12:00:00.000Z",
        "updatedAt": "2026-05-01T12:00:00.000Z"
      }
    ]
  }
}
```

**Notes:**
- `__v` field excluded from responses
- Categories sorted by creation date (default `_id` order)
- Used by frontend in:
  - Task creation form (category dropdown)
  - Worker registration/setup (category selection)
  - Task listing filters (by category)

---

## 2. GET /:id - Get Category By ID

**Functionality:** Fetches a specific category by its ID.

**Authentication:** Required (`verifyToken`)

**Authorization:** Any authenticated user

**URL Parameter:**
- `id`: MongoDB ObjectId of the category

**Request Example:**
```
GET /api/categories/65f1234567890abc12345678
Headers: Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "category": {
      "_id": "65f1234567890abc12345678",
      "name": "Cleaning",
      "createdAt": "2026-05-01T10:00:00.000Z",
      "updatedAt": "2026-05-01T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Invalid ID or Category not found` (if invalid ObjectId or not found)
- `404 Category not found` (explicit check)

---

## 3. GET /:id/workers - Get All Workers By Category

**Functionality:** Retrieves all users with role `worker` who belong to the specified category. Used to find available workers for a task type.

**Authentication:** Required (`verifyToken`)

**Authorization:** Any authenticated user

**URL Parameter:**
- `id`: MongoDB ObjectId of the category

**Request Example:**
```
GET /api/categories/65f1234567890abc12345678/workers
Headers: Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "workers": [
      {
        "_id": "worker_id_1",
        "userName": "mohamed_ahmed",
        "name": {
          "first": "Mohamed",
          "last": "Ahmed"
        },
        "email": "mohamed@example.com",
        "phoneNumber": "+201234567890",
        "role": "worker",
        "avatar": "https://cloudinary.com/.../avatar.jpg",
        "rating": 4.8,
        "categoryId": "65f1234567890abc12345678",
        "locationCoords": {
          "lat": 30.0444,
          "lng": 31.2357
        },
        "verifiedAt": "2026-05-01T10:00:00.000Z",
        "identityVerification": {
          "status": "verified"
        },
        "createdAt": "2026-05-01T09:00:00.000Z"
      },
      {
        "_id": "worker_id_2",
        "userName": "ali_mahmoud",
        "name": { "first": "Ali", "last": "Mahmoud" },
        "email": "ali@example.com",
        "role": "worker",
        "rating": 4.6,
        "categoryId": "65f1234567890abc12345678",
        // ... other fields
      }
    ]
  }
}
```

**Notes:**
- Filter: `{ categoryId: id, role: "worker" }`
- Returns full user objects (minus password, sensitive fields like `otp`, `resetPassword`)
- Workers without category (`categoryId: null`) excluded
- Useful for showing "available workers" to customers posting tasks

**Error Responses:**
- `500 Internal Server Error` if database query fails

---

## 4. POST / - Create Category

**Functionality:** Creates a new service category. Admin-only endpoint. Used by admins to add new service types to the platform.

**Authentication:** Required (`verifyToken`)

**Authorization:** Admin only (`allowedTo(Roles.admin)`)

**Request Body (application/json):**
```json
{
  "name": "Gardening"
}
```

**Validation Rules (`createCategorySchema`):**
- `name`: Required, string, trimmed, 2-50 characters

**Request Example:**
```
POST /api/categories
Headers: Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Gardening"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "category": {
      "_id": "new_category_id",
      "name": "Gardening",
      "createdAt": "2026-05-01T13:00:00.000Z",
      "updatedAt": "2026-05-01T13:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Validation Error` (name missing or invalid length)
- `400 Category already exists` (unique name constraint)
- `403 You do not have permission to perform this action` (non-admin)
- `401 The token is invalid` (auth failures)

---

## Category Model Schema

Full Mongoose schema (`src/Models/Category.model.js`):

```javascript
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    unique: true,
    trim: true,
    minLength: [2, "Category name must be at least 2 characters"],
    maxLength: [50, "Category name cannot exceed 50 characters"]
  }
}, {
  timestamps: true
});
```

**Indexes:**
- `{ name: 1 }` with `unique: true` (enforced at MongoDB level)

---

## Middleware Chain

All routes use:

1. **verifyToken** (`src/Middlewares/verifytoken.js`)
   - Validates JWT token
   - Checks blacklist, user status (deleted, suspended, banned)
   - Attaches `req.currentUser`

2. **allowedTo(...roles)** (admin routes only)
   - POST `/` requires `allowedTo(Roles.admin)`
   - GET routes allow any authenticated user

3. **Validation** (POST only)
   - `createCategorySchema` - express-validator array with `body("name")` rules
   - Errors collected via `validationResult(req)` in controller

---

## Error Response Format

Standardized `AppError` responses:

```json
{
  "status": "error",
  "message": "Error description",
  "data": null,
  "details": [ /* validation errors array if applicable */ ]
}
```

Common errors:
- `400 Validation Error` - with field-level details
- `400 Category already exists` - duplicate name
- `401 The token is required/invalid` - auth failures
- `403 You do not have permission` - non-admin trying to create
- `404 Category not found` - invalid ID
- `500 Internal Server Error` - unexpected DB errors

---

## Usage Examples

### Frontend: Load categories dropdown on task form

```javascript
const response = await fetch('/api/categories', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data } = await response.json();
const categories = data.categories.map(c => ({
  value: c._id,
  label: c.name
}));
// Populate <select> with categories
```

### Frontend: Find workers for a category

```javascript
const categoryId = '65f1234567890abc12345678';
const res = await fetch(`/api/categories/${categoryId}/workers`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data } = await res.json();
const workers = data.workers;
```

### Admin: Create a new category

```javascript
const res = await fetch('/api/categories', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${admin_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'Painting' })
});
const result = await res.json();
```

---

## Relationships

**Category → Tasks (One-to-Many)**
- `Task.categoryId` references `Category._id`
- One category can have many tasks

**Category → Users (One-to-Many for Workers)**
- `User.categoryId` references `Category._id` (only for workers)
- One category can have many worker profiles
- Workers are `role: "worker"` with a `categoryId` set
- Customers (`role: "user"`) generally have no `categoryId`

---

## Notes

- Base path mounted at `/api/categories` in `src/app.js:21`
- All GET routes accessible to any authenticated user
- Only POST (create) requires admin role
- Category name is **not encrypted** - stored as plain text
- Categories are **not soft-deleted** - no `deleted` flag (could be added later)
- Unique constraint on `name` prevents duplicates (case-sensitive)
- `__v` version key excluded from responses (`{ __v: 0 }` in find queries)
- No pagination on GET endpoints - categories are typically few (< 100)
- `getAllWorkersByCategory` returns full User objects; consider field selection for performance
- Category deletion is **not implemented** - use manual DB removal or add DELETE endpoint if needed
- Worker role is defined as `worker` in `Roles` enum

---

## Validation Details

**Create Category (`createCategorySchema`):**

```javascript
[
  body("name")
    .trim()
    .notEmpty().withMessage("Category name is required")
    .isLength({ min: 2, max: 50 })
      .withMessage("Category name must be between 2 and 50 characters")
]
```

Validator chain:
1. Trims whitespace from both ends
2. Rejects empty string after trim
3. Enforces min length 2, max length 50

No special characters restriction (allows Arabic names too).

---

## Common Integration Points

### With Tasks
- Task creation (`POST /api/tasks`) requires `categoryId` pointing to a valid category
- Frontend should fetch categories first to populate dropdown before task form

### With Users
- Worker registration/editing requires setting `categoryId` to valid category
- Admin can assign categories to workers via `PATCH /api/user/:id` with `categoryId`

### With Offers
- No direct link - offers are made on tasks, which belong to categories
- Potential future: filter offers by category, or category-based worker recommendations

---

## Potential Future Enhancements

- **Category icons/images** - Upload icon for each category
- **Category descriptions** - Long-form text explaining what the category covers
- **Parent/child categories** - Hierarchical categories (e.g., "Home Services" → "Cleaning", "Plumbing")
- **Category sorting/ordering** - `order` field for custom display order in UI
- **Soft delete** - `deleted: boolean` flag for admins to disable categories
- **Category status** - `active`/`inactive` to temporarily hide
- **Translation support** - `nameAr`, `nameEn` fields for multilingual apps
- **Pagination** on `/workers` endpoint if a category has thousands of workers
- **Search/filter** workers by rating, location within category
- **Count tasks per category** in response

---

## Security Considerations

- Admin-only endpoint (POST) - ensure admin tokens not leaked to frontend for untrusted users
- Category name uniqueness is enforced at DB level - handle duplicate key errors (code 11000)
- No user input directly used in queries except validated name (safe from injection)
- Category names visible to all users - no sensitive data

---

## Testing Notes

- Seed categories first before creating tasks or workers (foreign key constraints not enforced by MongoDB but logically required)
- Test duplicate category creation returns 400
- Test invalid ObjectId returns 400 (cast error)
- Verify admin token needed for POST
- Verify any authenticated user can GET all categories
