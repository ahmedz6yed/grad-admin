# Logs Feature Documentation

## Base URL
`http://localhost:3000/api/logs`

---

## Overview

The Logs endpoint provides access to system application logs for administrative purposes. Logs are stored in two ways:

1. **In-memory ring buffer** - Fast access to the most recent 200 log entries (kept in RAM)
2. **Daily log files** - Complete persistent logs on disk, one file per day at `logs/YYYY-MM-DD.log`

Both sources contain the same structured log format (JSON lines). The ring buffer offers fast paginated access; the daily file provides complete historical data.

---

## Log Entry Structure

Each log entry is a JSON object:

```typescript
{
  timestamp: string;     // ISO 8601: "2026-05-01T12:34:56.789Z"
  level: "error" | "warn" | "info";
  message: string;       // Human-readable log message
  // ... additional meta fields (contextual)
  // Examples: statusCode, path, method, ip, stack, details, etc.
}
```

Example log entry:
```json
{
  "timestamp": "2026-05-01T12:34:56.789Z",
  "level": "error",
  "message": "Route not found: GET /api/tasks/unknown",
  "method": "GET",
  "path": "/api/tasks/unknown",
  "ip": "::1"
}
```

---

## 1. GET / - Get Recent Logs (Ring Buffer)

**Functionality:** Returns the most recent log entries from the in-memory ring buffer. Fast, paginated access. Useful for real-time monitoring and recent error inspection.

**Authentication:** Required (`verifyToken`)

**Authorization:** Admin only (`allowedTo(Roles.admin)`)

**Query Parameters:**
- `level` (optional): Filter by level - one of `"error"`, `"warn"`, `"info"`
- `limit` (optional): Maximum number of entries to return (default: `100`, max: `200`)

**Request Examples:**
```
GET /api/logs
GET /api/logs?limit=50
GET /api/logs?level=error
GET /api/logs?level=warn&limit=30
```

**Response (200 OK):**
```json
{
  "status": "success",
  "count": 100,
  "data": {
    "logs": [
      {
        "timestamp": "2026-05-01T19:10:23.456Z",
        "level": "error",
        "message": "Task not found",
        "statusCode": 404,
        "path": "/api/tasks/65f1234567890abc12345678",
        "method": "GET",
        "ip": "::1"
      },
      {
        "timestamp": "2026-05-01T19:09:15.123Z",
        "level": "warn",
        "message": "Route not found: GET /api/task",
        "path": "/api/task",
        "method": "GET",
        "ip": "::1"
      }
      // ... up to `limit` entries, newest first
    ]
  }
}
```

**Notes:**
- Ring buffer size: 200 entries (hard limit in `SystemLogger.js:12`)
- Returned logs are sorted newest first (`.reverse()`)
- If `level` filter is provided, only matching entries are returned
- If no `limit` specified, defaults to 100

---

## 2. GET /today - Get Today's Full Log File

**Functionality:** Reads and returns all log entries from today's log file on disk. Slower than the ring buffer but returns complete history for the current day. Useful for detailed audit trails and investigations.

**Authentication:** Required (`verifyToken`)

**Authorization:** Admin only (`allowedTo(Roles.admin)`)

**Query Parameters:**
- `level` (optional): Filter by level - one of `"error"`, `"warn"`, `"info"`

**Request Examples:**
```
GET /api/logs/today
GET /api/logs/today?level=error
GET /api/logs/today?level=info
```

**Response (200 OK):**
```json
{
  "status": "success",
  "count": 342,
  "data": {
    "logs": [
      {
        "timestamp": "2026-05-01T19:12:01.789Z",
        "level": "info",
        "message": "Server started on http://localhost:3000"
      },
      {
        "timestamp": "2026-05-01T19:11:45.234Z",
        "level": "error",
        "message": "AI verification service is not running. Please start the Python service on port 5000.",
        "code": "ECONNREFUSED",
        "path": "/api/user/verify-identity",
        "method": "POST",
        "ip": "::1"
      }
      // ... all entries from logs/2026-05-01.log, newest first
    ]
  }
}
```

**Error Responses:**
- `500 Internal Server Error` if log file cannot be read (filesystem error)

**Notes:**
- Log file path: `<project-root>/logs/YYYY-MM-DD.log` (e.g., `logs/2026-05-01.log`)
- File is parsed line-by-line as JSON (malformed lines returned as `{ raw: line }`)
- If file doesn't exist (no logs yet), returns empty array: `{ count: 0, logs: [] }`
- Entries sorted newest first
- Slower than ring buffer due to disk I/O and JSON parsing of entire file

---

## Log Storage Details

### In-Memory Ring Buffer

- **Location:** `SystemLogger.js` - `logBuffer` array
- **Capacity:** 200 entries (MAX_BUFFER)
- **Behavior:** When full, oldest entry is removed (`shift()`) to make room
- **Use case:** Fast access to recent logs, ideal for dashboard widgets
- **Volatility:** Lost on server restart

### Daily Log Files

- **Directory:** `<project-root>/logs/`
- **Filename pattern:** `YYYY-MM-DD.log` (e.g., `2026-05-01.log`)
- **Format:** JSON lines (each entry is one JSON object on its own line)
- **Creation:** Automatic on first write of the day
- **Rotation:** Implicit by date - new file each day
- **Use case:** Complete persistent audit trail, forensic analysis
- **Retention:** Manual cleanup needed (not automatically rotated/deleted)

---

## Log Levels

| Level | Meaning | Use Cases |
|-------|---------|-----------|
| `error` | Serious failures, exceptions, crashes | Unhandled exceptions, DB connection failures, service outages, 5xx errors |
| `warn` | Warning conditions, non-critical issues | 404 routes, validation failures, rate limit hits, deprecated usage |
| `info` | Informational messages, normal operations | Server start/stop, auth events (login/logout), successful requests, background tasks |

All logs are written both to:
1. In-memory ring buffer (for API retrieval)
2. Daily log file (for persistence)
3. Console (stdout/stderr) - mirrored for local development visibility

---

## Example Log Meta Fields

Depending on the event, `SystemLogger` may attach additional context:

**Route Not Found (404):**
```json
{
  "timestamp": "...",
  "level": "warn",
  "message": "Route not found: GET /api/unknown",
  "method": "GET",
  "path": "/api/unknown",
  "ip": "::1"
}
```

**Server Error (500):**
```json
{
  "timestamp": "...",
  "level": "error",
  "message": "Database connection failed",
  "statusCode": 500,
  "path": "/api/tasks",
  "method": "GET",
  "ip": "::1",
  "stack": "Error: Database connection failed at ..."
}
```

**Authentication Failure:**
```json
{
  "timestamp": "...",
  "level": "warn",
  "message": "The token is invalid",
  "statusCode": 401,
  "path": "/api/user/profile",
  "method": "GET",
  "ip": "192.168.1.100"
}
```

**Validation Error:**
```json
{
  "timestamp": "...",
  "level": "warn",
  "message": "Validation Error",
  "statusCode": 400,
  "path": "/api/user/register",
  "method": "POST",
  "details": [
    { "msg": "Email is required", "path": "email" },
    { "msg": "Password is required", "path": "password" }
  ]
}
```

---

## Middleware Chain

Both routes share the same middleware chain:

```
1. verifyToken
   └─ Validates JWT from Authorization header
   └─ Checks token blacklist
   └─ Verifies user exists, not deleted/suspended/banned
   └─ Attaches req.currentUser

2. allowedTo(Roles.admin)
   └─ Checks req.currentUser.role === "admin"
   └─ Rejects with 403 if not admin

3. Route Handler
   └─ GET / → SystemLogger.getLogs()
   └─ GET /today → SystemLogger.readTodayLogs()
```

---

## Error Responses

### 403 Forbidden

Returned when authenticated user is not an admin:

```json
{
  "status": "error",
  "message": "You do not have permission to perform this action",
  "data": null
}
```

### 401 Unauthorized

Returned when:
- No `Authorization` header
- Invalid/expired JWT
- Token is blacklisted (logged out)
- User deleted, suspended, or banned

```json
{
  "status": "error",
  "message": "The token is required / The token is invalid / Your account has been deleted / Account suspended until ...",
  "data": null
}
```

### 500 Internal Server Error (GET /today only)

Returned when the log file cannot be read (e.g., permission denied, disk error):

```json
{
  "status": "error",
  "message": "Internal Server Error",
  "data": null
}
```

---

## Usage Examples

### Frontend: Fetch last 50 error logs

```javascript
fetch('/api/logs?level=error&limit=50', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('Recent errors:', data.data.logs);
});
```

### Frontend: Fetch all of today's logs

```javascript
fetch('/api/logs/today', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('Today logs:', data.data.logs);
});
```

### CLI: Check recent errors

```bash
curl -H "Authorization: Bearer <admin_token>" \
  "http://localhost:3000/api/logs?level=error&limit=20" | jq .
```

---

## Implementation Details

**SystemLogger API** (`src/Utils/Errors/SystemLogger.js`):

- `SystemLogger.error(message, meta)` - Log at ERROR level
- `SystemLogger.warn(message, meta)` - Log at WARN level
- `SystemLogger.info(message, meta)` - Log at INFO level
- `SystemLogger.getLogs({ level, limit })` - Get from ring buffer
- `SystemLogger.readTodayLogs()` - Read today's file from disk

**Ring Buffer Properties:**
- New entries always pushed to end
- Buffer reversed before returning (newest first)
- Capacity: 200 entries (LRU: least-recently-added removed when full)

**Log File Properties:**
- Directory auto-created on first write
- One file per day, named `logs/YYYY-MM-DD.log`
- Each line is a JSON string (NDJSON format)
- Appended asynchronously (non-blocking)
- Errors writing to file printed to console but don't crash the app

**Used By:**
- Express error handler middleware (`src/app.js:48`)
- `verifyToken` middleware (auth failures)
- All `AppError` instances logged via `SystemLogger`
- Application lifecycle events (server start)

---

## Security & Access Control

- **Admin-only** — Only users with `role: "admin"` can access these endpoints
- Regular users and workers receive `403 Forbidden`
- Logs may contain sensitive data (IP addresses, paths, error stacks)
- Ensure admin tokens are protected and not exposed to frontend accidentally
- In production, consider log aggregation external to the app (ELK, Datadog, etc.)

---

## Notes

- Mounted at `/api/logs` in `src/app.js:26`
- `SystemLogger` is a singleton utility used throughout the codebase
- Ring buffer holds maximum 200 entries; older entries discarded when full
- Daily file provides full retention but must be manually rotated/deleted
- Both endpoints return `{ status, count, data: { logs } }` shape
- Log levels: `error`, `warn`, `info` (no `debug` level in production)
- Get logs are reversed to show newest first
- File reader gracefully handles malformed JSON lines (returns `{ raw: line }`)
- Empty log file returns empty array

---

## Future Enhancements (Not Implemented)

Potential improvements:
- Log rotation/retention policy (delete logs older than N days)
- Log level configuration via env vars (e.g., `LOG_LEVEL=debug`)
- Search/filter by message substring, date range, status code
- Export logs as downloadable file (JSON/CSV)
- Pagination with `page`/`limit` for `/today` endpoint (currently loads all)
- Separate audit logs vs application logs
- Rate limiting on logs endpoints to prevent DoS
- Include request ID / correlation ID for tracing across services
