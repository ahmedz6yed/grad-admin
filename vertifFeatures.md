# v-features

This document describes the identity verification and review endpoints implemented in the backend.

## Route group
- `PATCH /api/user/review-identity/:id`
- `POST /api/user/verify-identity`

## Purpose
- `verify-identity`: allow a user to submit identity verification data.
- `review-identity`: allow an admin to approve or decline a user identity verification request.

## Implementation details
- Routes defined in `src/Routes/User.Router.js`
- Handlers in `src/Modules/User/user.controller.js`

## Endpoint details

### POST /api/user/verify-identity
- Uploads multipart form data:
  - `id_image`
  - `live_image`
- Middleware: `verifyToken`
- Handler: `verifyIdentity`

### PATCH /api/user/review-identity/:id
- Admin-only route
- Middleware: `verifyToken`, `allowedTo(Roles.admin)`
- Handler: `reviewIdentityVerification`
- Used to change verification status for a user by ID
