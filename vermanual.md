# Verification Manual — Frontend Integration Guide

## Overview

This document covers **two admin-only endpoints** used in the identity verification review workflow within the FixPay admin dashboard. These endpoints allow an admin to:

1. **View the AI verification result image** for a specific user
2. **Accept or decline** a user's identity verification

Both endpoints are **admin-only** (require `role: "admin"`) and require a valid JWT token.

---

## Prerequisites (Both Endpoints)

### Authentication Header

Every request must include the JWT token in the `Authorization` header:

```
Authorization: Bearer <admin_jwt_token>
```

### How to Get the Token

The token is returned from the login response:

```javascript
// After login
const { token } = loginResponse; // store this in localStorage, cookie, or state
```

### Base URL

```
http://localhost:3000/api/user
```

---

---

## Endpoint 1: Get AI Verification Result Image

### `GET /api/user/:id/ai-result`

### What It Does

Retrieves the **AI-generated result image** from the identity verification process for a specific user. This image is produced by the Python AI service and uploaded to Cloudinary during the `verify-identity` flow. It typically shows a side-by-side comparison of the ID photo vs. the live selfie with similarity/liveness annotations.

### When to Use It

- On the **admin user detail / verification review page**
- When the admin clicks on a user whose `identityVerification.status` is `"pending"` or any status where the admin wants to inspect the AI result
- Display this image **before** the admin makes an accept/decline decision

### URL Parameters

| Parameter | Type     | Required | Description                          |
|-----------|----------|----------|--------------------------------------|
| `id`      | `string` | ✅       | The MongoDB `_id` of the target user |

### Request Body

**None** — This is a `GET` request with no body.

### Request Example (Frontend)

```javascript
const getUserAiResult = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/user/${userId}/ai-result`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      // data.data.resultImage is the Cloudinary URL of the AI comparison image
      console.log("AI Result Image URL:", data.data.resultImage);
      return data.data.resultImage;
    } else {
      console.error("Error:", data.message);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
};
```

### Using Axios

```javascript
import axios from "axios";

const getUserAiResult = async (userId) => {
  try {
    const { data } = await axios.get(
      `http://localhost:3000/api/user/${userId}/ai-result`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // data.data.resultImage → Cloudinary URL string
    return data.data.resultImage;
  } catch (error) {
    if (error.response) {
      // Server responded with error
      console.error(error.response.data.message);
    }
  }
};
```

### Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "resultImage": "https://res.cloudinary.com/xxx/image/upload/v1234567890/FixPay/users/65abc.../ai_result/result_abc123.jpg"
  }
}
```

### Response Shape (TypeScript)

```typescript
interface AiResultResponse {
  status: "success";
  data: {
    resultImage: string; // Cloudinary secure URL of the AI comparison image
  };
}
```

### How to Display It in the Frontend

```jsx
// React Example
const VerificationReview = ({ userId }) => {
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/user/${userId}/ai-result`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          setResultImage(data.data.resultImage);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Failed to load AI result");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [userId]);

  if (loading) return <p>Loading AI result...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="ai-result-container">
      <h3>AI Verification Result</h3>
      <img
        src={resultImage}
        alt="AI Face Comparison Result"
        style={{ maxWidth: "100%", borderRadius: "8px" }}
      />
      {/* Render accept/decline buttons here — see Endpoint 2 */}
    </div>
  );
};
```

### Error Responses

| Status | Condition                                   | Response Body                                                                |
|--------|---------------------------------------------|------------------------------------------------------------------------------|
| `401`  | Missing/invalid/expired token               | `{ "status": "error", "message": "The token is required" }`                 |
| `403`  | User is not admin                           | `{ "status": "fail", "message": "You do not have permission..." }`          |
| `404`  | User not found                              | `{ "status": "fail", "message": "User not found" }`                         |
| `404`  | User has no AI result image yet             | `{ "status": "fail", "message": "AI result image not found for this user" }`|

### Important Notes

- The `resultImage` is a **Cloudinary URL** (hosted image). You can directly use it in an `<img>` tag.
- If the user has never submitted identity verification, this will return a `404`.
- The image is stored at path: `FixPay/users/<userId>/ai_result/` in Cloudinary.

---

---

## Endpoint 2: Review Identity Verification (Accept / Decline)

### `PATCH /api/user/review-identity/:id`

### What It Does

Allows an admin to **accept or decline** a user's identity verification. This is the final step in the manual review workflow — typically called after the admin has inspected the AI result image (Endpoint 1).

### When to Use It

- After the admin has viewed the AI result image and the user's verification details
- When the admin clicks an **"Accept"** or **"Decline"** button on the verification review page
- Primarily used when `identityVerification.status` is `"pending"` (near-threshold cases sent for admin review)

### URL Parameters

| Parameter | Type     | Required | Description                          |
|-----------|----------|----------|--------------------------------------|
| `id`      | `string` | ✅       | The MongoDB `_id` of the target user |

### Request Body (JSON)

| Field    | Type     | Required | Allowed Values          | Description                                   |
|----------|----------|----------|-------------------------|-----------------------------------------------|
| `action` | `string` | ✅       | `"accept"` or `"decline"` | The admin's decision on the verification      |

### Payload Shape (TypeScript)

```typescript
interface ReviewIdentityPayload {
  action: "accept" | "decline";
}
```

### Request Examples

#### Accept Verification (Frontend — Fetch)

```javascript
const reviewIdentity = async (userId, action) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/user/review-identity/${userId}`,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }), // "accept" or "decline"
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log(data.message); // "User identity verification has been accepted"
      return data.data.user;
    } else {
      console.error("Error:", data.message);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
};

// Usage:
await reviewIdentity("65f1234567890abc12345678", "accept");
await reviewIdentity("65f1234567890abc12345678", "decline");
```

#### Using Axios

```javascript
import axios from "axios";

// Accept
const acceptVerification = async (userId) => {
  const { data } = await axios.patch(
    `http://localhost:3000/api/user/review-identity/${userId}`,
    { action: "accept" },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

// Decline
const declineVerification = async (userId) => {
  const { data } = await axios.patch(
    `http://localhost:3000/api/user/review-identity/${userId}`,
    { action: "decline" },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};
```

### Success Response (200 OK)

#### When `action: "accept"`

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "65f1234567890abc12345678",
      "name": { "first": "Ahmed", "last": "Zayed" },
      "userName": "ahmed_zayed",
      "email": "ahmed@example.com",
      "role": "user",
      "identityVerification": {
        "status": "verified",
        "similarity": 0.72,
        "confidence": "medium",
        "liveness": true,
        "verifiedAt": "2026-06-03T14:30:00.000Z",
        "failReason": null,
        "resultImage": "https://res.cloudinary.com/xxx/image/upload/..."
      }
    }
  },
  "message": "User identity verification has been accepted"
}
```

#### When `action: "decline"`

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "65f1234567890abc12345678",
      "name": { "first": "Ahmed", "last": "Zayed" },
      "userName": "ahmed_zayed",
      "email": "ahmed@example.com",
      "role": "user",
      "identityVerification": {
        "status": "failed",
        "similarity": 0.72,
        "confidence": "medium",
        "liveness": true,
        "verifiedAt": null,
        "failReason": "Admin declined the verification",
        "resultImage": "https://res.cloudinary.com/xxx/image/upload/..."
      }
    }
  },
  "message": "User identity verification has been declined"
}
```

### Response Shape (TypeScript)

```typescript
interface ReviewIdentityResponse {
  status: "success";
  data: {
    user: {
      _id: string;
      name: { first: string; last: string };
      userName: string;
      email: string;
      phoneNumber?: string;
      role: string;
      avatar?: string;
      rating: number;
      identityVerification: {
        status: "verified" | "failed";          // "verified" on accept, "failed" on decline
        similarity: number;                      // e.g. 0.72
        confidence: string;                      // e.g. "medium", "high", "low"
        liveness: boolean;                       // true/false
        verifiedAt: string | null;               // ISO date string on accept, null on decline
        failReason: string | null;               // null on accept, "Admin declined the verification" on decline
        resultImage: string;                     // Cloudinary URL
      };
      // ... other user fields (address, locationCoords, etc.)
    };
  };
  message: string; // "User identity verification has been accepted" or "...declined"
}
```

### What Happens in the Backend

| Action     | `identityVerification.status` | `identityVerification.verifiedAt` | `identityVerification.failReason`         |
|------------|-------------------------------|-----------------------------------|-------------------------------------------|
| `"accept"` | `"verified"`                  | Current date/time                 | Set to `null`                             |
| `"decline"`| `"failed"`                    | Set to `null`                     | `"Admin declined the verification"`       |

### Error Responses

| Status | Condition                              | Response Body                                                          |
|--------|----------------------------------------|------------------------------------------------------------------------|
| `400`  | Missing `action` in body               | `{ "status": "fail", "message": "User ID and action are required" }`   |
| `400`  | Invalid `action` value                 | `{ "status": "fail", "message": "Invalid action. Must be 'accept' or 'decline'" }` |
| `401`  | Missing/invalid/expired token          | `{ "status": "error", "message": "The token is required" }`           |
| `403`  | User is not admin                      | `{ "status": "fail", "message": "You do not have permission..." }`    |
| `404`  | User not found by the given ID         | `{ "status": "fail", "message": "Not Found" }`                        |

---

---

## Full Workflow: How to Use Both Endpoints Together

### The Complete Admin Verification Review Flow

```
┌──────────────────────────────────────────────────────────┐
│  1. Admin Dashboard: List users with pending/failed      │
│     verification status                                  │
│     → GET /api/user  (filter by identityVerification     │
│       .status === "pending")                             │
├──────────────────────────────────────────────────────────┤
│  2. Admin clicks on a user → open review detail page     │
│     → GET /api/user/:id  (get full user details)         │
├──────────────────────────────────────────────────────────┤
│  3. Fetch and display the AI comparison result image     │
│     → GET /api/user/:id/ai-result                        │
│     → Display the resultImage in an <img> tag            │
├──────────────────────────────────────────────────────────┤
│  4. Admin reviews the image and user data, then clicks   │
│     "Accept" or "Decline"                                │
│     → PATCH /api/user/review-identity/:id                │
│       Body: { "action": "accept" }                       │
│       Body: { "action": "decline" }                      │
├──────────────────────────────────────────────────────────┤
│  5. Update the UI based on the response                  │
│     → Show success toast / redirect back to list         │
└──────────────────────────────────────────────────────────┘
```

### Complete React Component Example

```jsx
import React, { useState, useEffect } from "react";

const VerificationReviewPage = ({ userId, token }) => {
  const [resultImage, setResultImage] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviewDone, setReviewDone] = useState(false);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Step 1: Fetch user details
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user details
        const userRes = await fetch(
          `http://localhost:3000/api/user/${userId}`,
          { headers }
        );
        const userData = await userRes.json();
        if (userRes.ok) setUser(userData.data);

        // Get AI result image
        const aiRes = await fetch(
          `http://localhost:3000/api/user/${userId}/ai-result`,
          { headers }
        );
        const aiData = await aiRes.json();
        if (aiRes.ok) setResultImage(aiData.data.resultImage);
        else setError(aiData.message);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Step 2: Handle accept/decline
  const handleReview = async (action) => {
    setReviewLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/user/review-identity/${userId}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ action }), // "accept" or "decline"
        }
      );

      const data = await res.json();

      if (res.ok) {
        setReviewDone(true);
        setUser(data.data.user);
        alert(data.message); // or use a toast notification
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <div>Loading verification data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="verification-review">
      <h2>Identity Verification Review</h2>

      {/* User Info */}
      {user && (
        <div className="user-info">
          <p><strong>Name:</strong> {user.name?.first} {user.name?.last}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Status:</strong> {user.identityVerification?.status}</p>
          <p><strong>Similarity:</strong> {user.identityVerification?.similarity}</p>
          <p><strong>Confidence:</strong> {user.identityVerification?.confidence}</p>
          <p><strong>Liveness:</strong> {user.identityVerification?.liveness ? "✅ Passed" : "❌ Failed"}</p>
          {user.identityVerification?.failReason && (
            <p><strong>Fail Reason:</strong> {user.identityVerification.failReason}</p>
          )}
        </div>
      )}

      {/* AI Result Image */}
      {resultImage && (
        <div className="ai-result">
          <h3>AI Comparison Result</h3>
          <img
            src={resultImage}
            alt="AI Face Verification Result"
            style={{ maxWidth: "100%", border: "2px solid #ddd", borderRadius: "8px" }}
          />
        </div>
      )}

      {/* Action Buttons */}
      {!reviewDone && (
        <div className="actions" style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
          <button
            onClick={() => handleReview("accept")}
            disabled={reviewLoading}
            style={{ padding: "10px 24px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            ✅ Accept Verification
          </button>
          <button
            onClick={() => handleReview("decline")}
            disabled={reviewLoading}
            style={{ padding: "10px 24px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            ❌ Decline Verification
          </button>
        </div>
      )}

      {reviewDone && (
        <div style={{ marginTop: "20px", padding: "12px", background: "#f0fdf4", borderRadius: "8px" }}>
          <p>✅ Review completed. User status: <strong>{user?.identityVerification?.status}</strong></p>
        </div>
      )}
    </div>
  );
};

export default VerificationReviewPage;
```

---

## Quick Reference Summary

| Feature                | Endpoint 1: AI Result                      | Endpoint 2: Review Identity                     |
|------------------------|--------------------------------------------|-------------------------------------------------|
| **URL**                | `GET /api/user/:id/ai-result`              | `PATCH /api/user/review-identity/:id`           |
| **Method**             | `GET`                                      | `PATCH`                                         |
| **Auth**               | Admin JWT required                         | Admin JWT required                              |
| **Request Body**       | None                                       | `{ "action": "accept" \| "decline" }`           |
| **Content-Type**       | Not needed (GET)                           | `application/json`                              |
| **Returns**            | `{ data: { resultImage: string } }`        | `{ data: { user: UserObject }, message: string }` |
| **Key data**           | Cloudinary image URL                       | Updated user with new verification status       |
| **Purpose**            | Display AI face comparison to admin        | Admin accepts or declines the verification      |

---

## Identity Verification Status Flow

```
                    User submits ID + selfie
                    POST /api/user/verify-identity
                              │
                    ┌─────────┼─────────┐
                    │         │         │
              AI: Match   AI: Close   AI: Far from
              + Live      to threshold threshold
                    │         │         │
                    ▼         ▼         ▼
              "verified"  "pending"  "failed"
                              │
                    Admin reviews using:
                    GET /:id/ai-result
                    PATCH /review-identity/:id
                              │
                    ┌─────────┴─────────┐
                    │                   │
              action:"accept"     action:"decline"
                    │                   │
                    ▼                   ▼
              "verified"           "failed"
              verifiedAt=now    failReason="Admin declined"
```

---

## `identityVerification` Schema Reference

From `User.model.js`:

```javascript
identityVerification: {
  status:      String,  // "unverified" | "pending" | "verified" | "failed"  (default: "unverified")
  similarity:  Number,  // e.g. 0.72 — face similarity score from AI
  confidence:  String,  // e.g. "high", "medium", "low" — AI confidence level
  liveness:    Boolean, // true if the live image passed the liveness check
  verifiedAt:  Date,    // timestamp of successful verification, or null
  failReason:  String,  // reason for failure/decline, or null on success
  resultImage: String,  // Cloudinary URL of the AI comparison image
}
```
