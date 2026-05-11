# Report Feature - Admin Endpoints Documentation

## Base URL

`http://localhost:3000/api/reports`

---

## Overview

The Reports API allows users to report other users for policy violations. Admins can review reports, update their status, and ban/unban users. This document covers **admin-only endpoints only**.

---

## Report Model Fields

| Field          | Type     | Required | Enum Values               | Description                               |
| -------------- | -------- | -------- | ------------------------- | ----------------------------------------- |
| `_id`          | ObjectId | Auto     | -                         | Unique report identifier                  |
| `reportedBy`   | ObjectId | Yes      | -                         | User ID who filed the report (ref: Users) |
| `reportedUser` | ObjectId | Yes      | -                         | User ID who was reported (ref: Users)     |
| `reason`       | String   | Yes      | See `ReportReasons` below | Category of violation                     |
| `description`  | String   | Yes      | 10-500 chars              | Detailed explanation                      |
| `status`       | String   | No       | See `ReportStatus` below  | Current review state (default: `pending`) |
| `adminNotes`   | String   | No       | -                         | Internal admin comments                   |
| `resolvedBy`   | ObjectId | No       | -                         | Admin User ID who handled the report      |
| `resolvedAt`   | Date     | No       | -                         | Timestamp when report was resolved        |
| `createdAt`    | Date     | Auto     | -                         | When report was submitted                 |

---

## Report Reasons Enum (`ReportReasons`)

```javascript
export const ReportReasons = {
  FRAUD: "fraud",
  INAPPROPRIATE_BEHAVIOR: "inappropriate_behavior",
  POOR_SERVICE: "poor_service",
  SPAM: "spam",
  HARASSMENT: "harassment",
  OTHER: "other",
};
```

---

## Report Status Enum (`ReportStatus`)

```javascript
export const ReportStatus = {
  PENDING: "pending", // Not yet reviewed
  REVIEWED: "reviewed", // Reviewed but not action taken
  RESOLVED: "resolved", // Action taken, issue addressed
  DISMISSED: "dismissed", // Report rejected, no action
};
```

---

## Admin Middleware Chain

All admin endpoints require:

1. **verifyToken** (`src/Middlewares/verifytoken.js`)
   - Validates JWT token
   - Checks token blacklist
   - Verifies user exists, not deleted/suspended/banned
   - Attaches `req.currentUser`

2. **allowedTo(Roles.admin)**
   - Checks `req.currentUser.role === "admin"`
   - Rejects with 403 if not admin

---

## 1. GET / - Get All Reports (Admin)

**Functionality:** Retrieves all reports with optional filtering by status and reason. Supports pagination. Used by admins for moderation dashboard.

**Full URL:** `GET /api/reports`

**Authentication:** Required (`verifyToken`)

**Authorization:** Admin only (`allowedTo(Roles.admin)`)

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status - one of `pending`, `reviewed`, `resolved`, `dismissed`
- `reason` (optional): Filter by reason - one of `fraud`, `inappropriate_behavior`, `poor_service`, `spam`, `harassment`, `other`

**Request Examples:**

```
GET /api/reports
GET /api/reports?page=1&limit=20
GET /api/reports?status=pending
GET /api/reports?reason=fraud&status=pending
GET /api/reports?limit=50&status=resolved
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "reports": [
      {
        "_id": "report_id_1",
        "reportedBy": {
          "_id": "user_id_1",
          "userName": "john_doe",
          "name": { "first": "John", "last": "Doe" },
          "email": "john@example.com"
        },
        "reportedUser": {
          "_id": "user_id_2",
          "userName": "bad_worker",
          "name": { "first": "Bad", "last": "Worker" },
          "email": "bad@example.com"
        },
        "reason": "fraud",
        "description": "This user is scamming customers with fake services",
        "status": "pending",
        "adminNotes": null,
        "resolvedBy": null,
        "resolvedAt": null,
        "createdAt": "2026-05-01T14:30:00.000Z"
      },
      {
        "_id": "report_id_2",
        "reportedBy": {
          /* reporter info */
        },
        "reportedUser": {
          /* reported user info */
        },
        "reason": "poor_service",
        "description": "Worker did not show up on time...",
        "status": "reviewed",
        "adminNotes": "Checked task history, multiple complaints",
        "resolvedBy": {
          "_id": "admin_id",
          "userName": "admin_user"
        },
        "resolvedAt": "2026-05-01T16:00:00.000Z",
        "createdAt": "2026-05-01T13:45:00.000Z"
      }
    ],
    "pagination": {
      "totalReports": 45,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

**Response Structure:**

```json
{
  "status": "success",
  "data": {
    "reports": [ /* array of report objects with populated user data */ ],
    "pagination": {
      "totalReports": number,
      "page": number,
      "limit": number,
      "totalPages": number
    }
  }
}
```

**Notes:**

- `reportedBy` and `reportedUser` are populated with User objects (minus sensitive fields)
- Filters are AND-combined (status + reason filters together)
- Pagination applied after filtering
- Default sort: newest first (by `createdAt` descending)

---

## 2. GET /:id - Get Report By ID (Admin)

**Functionality:** Fetches a single report by its ID with full populated user data. Used by admins to review a specific report in detail.

**Full URL:** `GET /api/reports/:id`

**Authentication:** Required (`verifyToken`)

**Authorization:** Admin only (`allowedTo(Roles.admin)`)

**URL Parameter:**

- `id`: MongoDB ObjectId of the report

**Request Example:**

```
GET /api/reports/65f1234567890abc12345678
Headers: Authorization: Bearer <admin_token>
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "report": {
      "_id": "report_id",
      "reportedBy": {
        "_id": "reporter_id",
        "userName": "john_doe",
        "name": { "first": "John", "last": "Doe" },
        "email": "john@example.com",
        "role": "user",
        "rating": 5.0,
        "avatar": "https://cloudinary.com/.../avatar.jpg"
      },
      "reportedUser": {
        "_id": "reported_id",
        "userName": "bad_worker",
        "name": { "first": "Bad", "last": "Worker" },
        "email": "bad@example.com",
        "role": "worker",
        "rating": 2.1,
        "avatar": "https://cloudinary.com/.../bad.jpg",
        "bannedAt": null,
        "isBanned": false
      },
      "reason": "harassment",
      "description": "The worker used inappropriate language during the task...",
      "status": "pending",
      "adminNotes": null,
      "resolvedBy": null,
      "resolvedAt": null,
      "createdAt": "2026-05-01T15:00:00.000Z",
      "updatedAt": "2026-05-01T15:00:00.000Z"
    }
  }
}
```

**Error Responses:**

- `404 Report not found` - Invalid ID or report doesn't exist
- `403 You do not have permission to perform this action` - Not admin

---

## 3. PATCH /:id/status - Update Report Status (Admin)

**Functionality:** Updates the status of a report and optionally adds admin notes. Used after reviewing a report to indicate what action was taken.

**Full URL:** `PATCH /api/reports/:id/status`

**Authentication:** Required (`verifyToken`)

**Authorization:** Admin only (`allowedTo(Roles.admin)`)

**URL Parameter:**

- `id`: MongoDB ObjectId of the report

**Request Body (application/json):**

```json
{
  "status": "resolved", // Required: "pending" | "reviewed" | "resolved" | "dismissed"
  "adminNotes": "User warned about behavior. 1-week suspension applied." // Optional: internal notes
}
```

**Allowed Status Transitions:**

- Any status can be set (no strict transition rules enforced)
- Typical flow: `pending` → `reviewed` → `resolved`/`dismissed`

**Request Example:**

```
PATCH /api/reports/65f1234567890abc12345678/status
Headers: Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "resolved",
  "adminNotes": "User confirmed guilty. Banned for 30 days."
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Report status updated to 'resolved'",
  "data": {
    "report": {
      "_id": "report_id",
      "reportedBy": {
        /* populated */
      },
      "reportedUser": {
        /* populated */
      },
      "reason": "fraud",
      "description": "...",
      "status": "resolved",
      "adminNotes": "User confirmed guilty. Banned for 30 days.",
      "resolvedBy": {
        "_id": "admin_id",
        "userName": "admin_user"
      },
      "resolvedAt": "2026-05-01T17:00:00.000Z",
      "createdAt": "2026-05-01T14:30:00.000Z",
      "updatedAt": "2026-05-01T17:00:00.000Z"
    }
  }
}
```

**Behavior:**

- `adminNotes` saved to `report.adminNotes`
- `resolvedBy` set to current admin's user ID
- `resolvedAt` set to current timestamp (only if status changed to `resolved` or `dismissed`?)

**Error Responses:**

- `400 Status is required`
- `400 Invalid status. Must be one of: pending, reviewed, resolved, dismissed`
- `404 Report not found`
- `403 You do not have permission to perform this action`

---

## 4. POST /ban/:id - Ban User (Admin)

**Functionality:** Permanently bans a user (sets `isBanned: true`). Used by admins to take action against reported users after investigation. Requires user ID in URL (reported user's ID).

**Full URL:** `POST /api/reports/ban/:id`

**Authentication:** Required (`verifyToken`)

**Authorization:** Admin only (`allowedTo(Roles.admin)`)

**URL Parameter:**

- `id`: MongoDB ObjectId of the **user to ban** (the reported user)

**Request Body (application/json):**

```json
{
  "banReason": "Multiple fraud reports confirmed. Immediate ban." // Optional: reason for ban
}
```

**Request Example:**

```
POST /api/reports/ban/65f1234567890abc12345678
Headers: Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "banReason": "Confirmed fraud pattern from multiple reports"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "User has been banned successfully",
  "data": {
    "user": {
      "_id": "banned_user_id",
      "email": "baduser@example.com",
      "userName": "bad_user",
      "name": { "first": "Bad", "last": "User" },
      "role": "worker",
      "isBanned": true,
      "bannedAt": "2026-05-01T18:00:00.000Z",
      "banReason": "Multiple fraud reports confirmed",
      "suspendedUntil": null,
      "suspensionReason": null
    }
  }
}
```

**Updates to User object:**

- `isBanned: true`
- `bannedAt: <current timestamp>`
- `banReason: <provided reason or "No reason provided">`

**Error Responses:**

- `400 User ID is required`
- `404 User not found`
- `400 User is already banned`
- `403 Cannot ban an admin user`
- `403 You do not have permission to perform this action`

**Notes:**

- Admins cannot be banned (role check)
- Banned users cannot log in (`verifyToken` blocks them)
- Does NOT delete or deactivate the user account (soft ban flag only)

---

## 5. POST /unban/:id - Unban User (Admin)

**Functionality:** Removes a permanent ban from a user (sets `isBanned: false`). Reverses a previous ban action.

**Full URL:** `POST /api/reports/unban/:id`

**Authentication:** Required (`verifyToken`)

**Authorization:** Admin only (`allowedTo(Roles.admin)`)

**URL Parameter:**

- `id`: MongoDB ObjectId of the user to unban

**Request Body:** None (empty body)

**Request Example:**

```
POST /api/reports/unban/65f1234567890abc12345678
Headers: Authorization: Bearer <admin_token>
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "User has been unbanned successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "formerlybanned@example.com",
      "userName": "unbanned_user",
      "name": { "first": "Formerly", "last": "Banned" },
      "role": "worker",
      "isBanned": false,
      "bannedAt": "2026-05-01T18:00:00.000Z", // Previous ban timestamp remains in history
      "banReason": "Multiple fraud reports confirmed",
      "suspendedUntil": null,
      "suspensionReason": null
    }
  }
}
```

**Updates to User object:**

- `isBanned: false`
- `bannedAt` remains in DB (historical record kept)
- `banReason` remains in DB (kept for audit)

**Error Responses:**

- `400 User ID is required`
- `404 User not found`
- `400 User is not banned`
- `403 You do not have permission to perform this action`

**Notes:**

- Unbanning does not clear `bannedAt` or `banReason` from the record - useful for audit trail
- After unbanning, user can log in normally
- No body content required in request

---

## Admin Workflow Example

1. **Review pending reports**

   ```
   GET /api/reports?status=pending
   ```

   - See all new reports needing attention
   - Click a report ID for details

2. **Read report details**

   ```
   GET /api/reports/:reportId
   ```

   - See reporter's and reported user's full profile
   - Check user's history (rating, past reports)

3. **Update report status** (mark as reviewed while investigating)

   ```
   PATCH /api/reports/:reportId/status
   {
     "status": "reviewed",
     "adminNotes": "Checking task history..."
   }
   ```

4. **Take action** - If confirmed violation:

   ```
   POST /api/reports/ban/:userId
   {
     "banReason": "Confirmed fraud from report #reportId"
   }
   ```

   Then update report status:

   ```
   PATCH /api/reports/:reportId/status
   {
     "status": "resolved",
     "adminNotes": "User banned for 30 days"
   }
   ```

5. **Or dismiss** if false report:

   ```
   PATCH /api/reports/:reportId/status
   {
     "status": "dismissed",
     "adminNotes": "Insufficient evidence"
   }
   ```

6. **Unban later** (if user appeals or ban expires):
   ```
   POST /api/reports/unban/:userId
   ```

---

## Email Notifications (Not Shown)

The `Services` layer likely includes email notifications for:

- Report submitted confirmation to reporter
- Notification to reported user (if action taken)
- Ban notification to banned user
- Admins notified of severe reports (maybe)

(Email sending handled in `src/Utils/Services/sendEmail.service.js`)

---

## Security & Permissions

- **Admin-only access** - All endpoints require `role: "admin"`
- Regular users/workers receive `403 Forbidden`
- Admins can ban any user **except other admins** (protected)
- All admin actions are logged via `SystemLogger`
- Report status changes are tracked via `resolvedBy` (admin ID) and `resolvedAt` (timestamp)
- User ban history preserved (`bannedAt`, `banReason` remain after unban)

---

## Error Handling

Standardized error responses:

**400 Bad Request:**

```json
{
  "status": "error",
  "message": "Status is required",
  "data": null
}
```

**403 Forbidden:**

```json
{
  "status": "error",
  "message": "You do not have permission to perform this action",
  "data": null
}
```

**404 Not Found:**

```json
{
  "status": "error",
  "message": "Report not found / User not found",
  "data": null
}
```

---

## Notes

- Base path mounted at `/api/reports` in `src/app.js:25`
- Reports collection name in MongoDB: `Reports` (plural, capitalized)
- All admin endpoints pass through `verifyToken` then `allowedTo(Roles.admin)`
- Banning a user does **NOT** delete their data - preserves reports, tasks, offers for audit
- Report statuses are not auto-transitioned; admin manually sets them
- `resolvedAt` is set by backend service when status becomes `resolved` or `dismissed`
- `adminNotes` optional but recommended for audit trail
- Filter `status` and `reason` are optional; omit to get all reports
- Pagination defaults: page=1, limit=10
- Total count included in response for pagination UI
- User object in responses excludes sensitive fields (password, otp, resetPassword, etc.) due to `.select("-password -__v")` or toJSON getters

---

## Comparison: User vs Admin Endpoints

| Endpoint            | User/Worker        | Admin                | Purpose                  |
| ------------------- | ------------------ | -------------------- | ------------------------ |
| `POST /`            | ✓ Create report    | (can also create)    | Report another user      |
| `GET /my-reports`   | ✓ View own reports |                      | See my submitted reports |
| `GET /`             |                    | ✓ List all reports   | Moderation queue         |
| `GET /:id`          |                    | ✓ View single report | Detailed review          |
| `PATCH /:id/status` |                    | ✓ Update status      | Process report           |
| `POST /ban/:id`     |                    | ✓ Ban user           | Take action              |
| `POST /unban/:id`   |                    | ✓ Unban user         | Lift ban                 |

---

## Testing Scenarios

1. **List pending reports**

   ```
   GET /api/reports?status=pending&limit=20
   ```

2. **Filter by fraud reason**

   ```
   GET /api/reports?reason=fraud
   ```

3. **View single report with populated users**

   ```
   GET /api/reports/:reportId
   ```

4. **Update status with admin notes**

   ```
   PATCH /api/reports/:reportId/status
   { "status": "resolved", "adminNotes": "Evidence confirmed" }
   ```

5. **Ban reported user**

   ```
   POST /api/reports/ban/:reportedUserId
   { "banReason": "Multiple confirmed reports" }
   ```

6. **Unban user**

   ```
   POST /api/reports/unban/:userId
   ```

7. **Try to ban an admin** - Should return 403
8. **Try to ban already banned** - Should return 400 "User is already banned"
9. **Non-admin access** - Should return 403 on all admin endpoints

---

## Database Indexes (Recommended)

Add indexes for performance:

```javascript
// In Report.model.js or via migration
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ reason: 1 });
```

---

## Future Enhancements

- **Auto-dismiss after X days** for low-priority reports
- **Report categories severity weights** (fraud = high, spam = low)
- **Escalation to support team** for complex cases
- **Email notifications** to admins for new high-severity reports
- **Bulk actions** - ban multiple users from one page
- **Appeal process** - banned users can submit appeal
- **Audit log** - track all admin actions on reports separately
- **Report count per user** - auto-flag users with many reports
- **Integration with logs** - link report to specific log entries
