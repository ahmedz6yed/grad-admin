# Password Reset OTP API

**Base URL:** `http://localhost:3000/api`

---

## POST /user/resend-resetpassword-otp

Request a new password reset OTP after initiating a forgot password flow.

### Headers

No authentication required

### Request

**Content-Type:** `application/json`

```json
{
  "email": "ahmed@example.com"
}
```

**Validation:**

- `email`: Required, valid email format, must be verified in the system

**Note:** This endpoint is identical to `POST /user/forgotPassword`. It always returns `200 OK` even if the email does not exist (security best practice — prevents email enumeration).

### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "If the email exists and is verified, a reset OTP has been sent."
}
```

**Behavior:**

If the email exists and is verified, a new 6-digit OTP is generated and sent via email. The previous OTP (if any) is invalidated.

### Error Responses

```json
{
  "status": "error",
  "message": "Please verify your email before requesting a password reset"
}
```

```json
{
  "status": "error",
  "message": "Please wait 45 seconds before requesting a new OTP."
}
```

**Error Conditions:**

- `403`: Email not verified — user must verify email before resetting password
- `429`: Rate limit exceeded — 60-second cooldown between OTP requests for the same email

### Rate Limiting

- **Cooldown:** 60 seconds between requests per email
- **OTP Expiry:** 15 minutes from generation
- **OTP Type:** `RESET_PASSWORD` (distinct from registration confirmation OTP)

### Security Notes

- Does not reveal whether an email exists in the system (always returns generic success)
- Requires email to be verified before issuing reset OTP
- Old OTP is invalidated when a new one is generated
- OTP stored hashed in database (not plaintext)
- After OTP is used or expires, user must request a new one

### Frontend Usage Example

```js
const resendResetPasswordOtp = async (email) => {
  const response = await axios.post('http://localhost:3000/api/user/resend-resetpassword-otp', {
    email
  });

  // Always 200 — show success message to user
  alert('If the email exists and is verified, a reset OTP has been sent.');

  return response.data;
};
```

### Related Endpoints

- `POST /user/forgotPassword` — identical behavior, first request for reset OTP
- `POST /user/resetPassword` — submit OTP + new password to complete reset
