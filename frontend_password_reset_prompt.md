# Frontend Password Reset Flow Implementation Prompt

## Project Context

FixPay Frontend — implementing the complete forgot/reset password user flow against an existing Express.js + MongoDB backend.

**Backend Base URL:** `http://localhost:3000/api`

**Backend is already implemented** with these endpoints (fully functional):

- `POST /api/user/forgotPassword`
- `POST /api/user/resend-resetpassword-otp`
- `POST /api/user/resetPassword`

Reference documentation: `userzayed.md`

---

## Overview: Password Reset User Flow

Three-step flow:

1. **Enter Email** — user types email, requests OTP
2. **Enter OTP + New Password** — user enters 6-digit OTP from email + new password (with confirmation)
3. **Success** — password updated, redirect to login

Optional: "Resend OTP" button if user doesn't receive email.

---

## API Contract (Backend Expectations)

### 1. POST `/api/user/forgotPassword`

**Purpose:** Request password reset OTP for an email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "If the email exists and is verified, a reset OTP has been sent"
}
```

**Important:** Always returns 200 even if email not registered (security). Do not reveal whether email exists.

**Rate Limit:** 60 seconds cooldown per email. Returns 429 if spammed.

**Error (403):**
```json
{
  "status": "error",
  "message": "Please verify your email before requesting a password reset"
}
```

---

### 2. POST `/api/user/resend-resetpassword-otp`

**Purpose:** Request another OTP if the previous one expired/lost.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "If the email exists and is verified, a reset OTP has been sent."
}
```

**Rate Limit:** 60 seconds cooldown per email.

**Error (403):** Same as forgotPassword — email not verified.

---

### 3. POST `/api/user/resetPassword`

**Purpose:** Submit OTP + new password to complete reset.

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPass1234"
}
```

**Password Requirements:**
- Min 8, max 100 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password reset successfully"
}
```

**Error (400):**
```json
{
  "status": "error",
  "message": "Invalid or expired OTP"
}
```

**Error (400):**
```json
{
  "status": "error",
  "message": "Email, OTP and new password are required"
}
```

---

## Frontend Implementation Requirements

### Screens / Views

#### Screen 1: Forgot Password — Email Input

**Fields:**
- `email` — email input (type="email", required, validated)

**Buttons:**
- **Send OTP** — submits email to `/forgotPassword`
- **Back to Login** — link to login page

**States:**
- `idle` → show email field + button
- `loading` → disable button, show spinner
- `success` → show message "If the email exists and is verified, a reset OTP has been sent", then auto-advance to Screen 2 after 2 seconds (or show "Continue" button)
- `error` — show error toast/message if 403 (email not verified) or network error

**Validation (client-side):**
- Email format required (use regex or `type="email"`)
- Show inline error if invalid before API call

---

#### Screen 2: Reset Password — OTP + New Password

**Fields:**
- `otp` — 6-digit numeric input (maxLength=6, inputmode="numeric")
- `newPassword` — password input (show/hide toggle)
- `confirmPassword` — password confirmation (must match `newPassword`)

**Buttons:**
- **Reset Password** — submits to `/resetPassword`
- **Resend OTP** — calls `/resend-resetpassword-otp` (disabled if cooldown active)
- **Back** — returns to Screen 1

**States:**
- `idle` — show empty fields
- `loading` — disable all buttons, show spinner on submit
- `success` — show "Password reset successfully", redirect to login after 3 seconds
- `error` — show error toast (invalid OTP, network error, etc.)

**Cooldown Timer for Resend:**
- After first OTP request, start 60-second countdown
- "Resend OTP" button disabled during cooldown
- Show text: "Resend OTP in 60s" → countdown → "Resend OTP" enabled
- Reset cooldown when user returns to Screen 1 and re-enters email

**Validation:**
- `otp`: exactly 6 digits, numeric only
- `newPassword`: min 8 chars, requires uppercase, lowercase, number (match backend rules)
- `confirmPassword`: must equal `newPassword`
- Show inline validation messages as user types

---

### State Management (Suggestions)

**Option A — React Context / Zustand / Redux:**

Store reset flow state:

```javascript
{
  step: 1 | 2, // current screen
  email: "",
  otp: "",
  newPassword: "",
  confirmPassword: "",
  isLoading: false,
  error: null,
  resendCooldown: 0, // seconds remaining
  success: false
}
```

**Option B — URL query params:**

- After Screen 1 success, navigate to `/reset-password?email=user@example.com`
- Screen 2 reads email from URL
- Keeps flow bookmarkable

**Option C — Local component state only:**

Pass `email` as prop from Screen 1 → Screen 2. Simple, no global store needed for 2-screen flow.

---

### API Integration Examples (Axios)

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// Screen 1: Request OTP
const requestResetOtp = async (email) => {
  const response = await axios.post(`${API_BASE}/user/forgotPassword`, {
    email
  });

  if (response.status === 200) {
    return { success: true, message: response.data.message };
  }
};

// Screen 2: Resend OTP
const resendResetOtp = async (email) => {
  const response = await axios.post(`${API_BASE}/user/resend-resetpassword-otp`, {
    email
  });

  if (response.status === 200) {
    return { success: true, message: response.data.message };
  }
};

// Screen 2: Submit Reset
const submitResetPassword = async (email, otp, newPassword) => {
  const response = await axios.post(`${API_BASE}/user/resetPassword`, {
    email,
    otp,
    newPassword
  });

  if (response.status === 200) {
    return { success: true, message: response.data.message };
  }
};
```

---

### UI/UX Requirements

**Email Input Screen:**
- Clean, centered card layout
- Email input with label + error message below
- Primary button: "Send OTP" (loading state)
- "Back to Login" link below button
- On success: show green checkmark + "Check your email" message + "Continue" button (or auto-advance)

**Reset Password Screen:**
- Show masked email (e.g., `user@example.com`) with "Change email" link to go back
- OTP input: 6-digit boxes OR single input with `maxLength=6`
- New Password input with visibility toggle (eye icon)
- Confirm Password input with visibility toggle
- Real-time password strength indicator (optional)
- Inline validation: show red text under each invalid field
- Primary button: "Reset Password" (loading state)
- Secondary button/link: "Resend OTP" with cooldown timer
- "Back" link to modify email

**Success Screen:**
- Green checkmark animation
- "Password reset successfully"
- "Redirecting to login in 3 seconds..." or "Go to Login" button

**Error Handling:**
- Toast notifications or inline error banners (red background)
- Display `error.message` from API response
- Network error: "Unable to connect. Check your internet."
- Validation error: highlight specific field

---

### Password Validation Rules (Client-side)

Mirror backend rules:

- Min 8 characters
- At least one uppercase letter (`/[A-Z]/`)
- At least one lowercase letter (`/[a-z]/`)
- At least one number (`/\d/`)
- Confirm password must match exactly

Show progress indicators:
- [ ] 8+ characters
- [ ] Uppercase letter
- [ ] Lowercase letter
- [ ] Number
- [ ] Passwords match

---

### Cooldown Timer Logic

After calling `forgotPassword` or `resend-resetpassword-otp`:

```javascript
const startCooldown = () => {
  setResendCooldown(60);
  const timer = setInterval(() => {
    setResendCooldown((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};
```

Disable "Resend OTP" button when `resendCooldown > 0`. Display: `Resend OTP (${resendCooldown}s)`.

---

### API Error Mapping

Map backend error responses to UI messages:

| HTTP Code | `message` | UI Display |
|-----------|-----------|------------|
| 400 | "Email, OTP and new password are required" | "All fields are required" (highlight empty fields) |
| 400 | "Invalid or expired OTP" | "Invalid or expired OTP. Please request a new one." |
| 403 | "Please verify your email before requesting a password reset" | "Please verify your email first. Check your inbox for the verification link." |
| 429 | "Please wait X seconds before requesting a new OTP." | Show as toast/banner with countdown |
| 500 | "Internal Server Error" | "Something went wrong. Please try again later." |

---

### Redirection / Navigation Flow

```
[Login Page]
   ↓ "Forgot Password?" link
[Forgot Password — Email Input]
   ↓ (success) → stores email in state/URL
[Reset Password — OTP + New Password]
   ↓ (success) → shows success screen
[Success Screen] → auto-redirect to Login after 3s
```

**From Reset Password screen:**
- "Change email" → back to Email Input (prefill email? optional)
- "Back" → back to Email Input

---

## Technical Specs

### Framework

Use whatever frontend framework is in use (React / Vue / Angular / vanilla JS). Implement as a component/page that can be routed.

### Styling

Follow existing design system / Tailwind / CSS modules used in the project. If none, use clean, minimal styling.

### Routing

If using React Router / Vue Router:

```jsx
// React example
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
<Route path="/reset-password" element={<ResetPasswordPage />} />
```

Or as a single multi-step component with conditional rendering based on `step` state.

### Accessibility

- All inputs have proper `label` or `aria-label`
- Error messages announced via `aria-live="polite"`
- Keyboard navigation works (Tab/Enter)
- Focus management: after error, focus moves to first invalid field

### Loading States

- Show spinner/skeleton on buttons during API calls
- Disable form submission while loading to prevent double-submit

---

## Deliverables

1. **ForgotPasswordPage** — email input screen
2. **ResetPasswordPage** — OTP + new password screen (with resend cooldown)
3. **PasswordResetSuccessPage** — success confirmation + redirect
4. **Reusable components** (optional):
   - `PasswordInput` with visibility toggle
   - `OtpInput` with 6 boxes
   - `PasswordStrengthIndicator`
   - `CountdownButton` for resend

5. **State management** (choose appropriate approach for project)
6. **Routing integration** — add routes to main router
7. **Error handling** — consistent UI error display
8. **Cooldown timer** — for resend OTP button (60 seconds)
9. **Client-side validation** — mirror backend rules
10. **Responsive design** — mobile-friendly (inputs full-width on mobile)

---

## Testing Checklist

- [ ] Email input accepts valid email, rejects invalid format
- [ ] "Send OTP" button shows loading state, disables during request
- [ ] On success (200), advances to next screen
- [ ] On 403, shows "verify email first" message
- [ ] On network error, shows retry option
- [ ] OTP input only accepts numbers, max 6 digits
- [ ] Password fields show/hide toggle works
- [ ] Password validation messages update in real time
- [ ] Confirm password must match
- [ ] "Resend OTP" disabled during 60s cooldown, countdown visible
- [ ] "Reset Password" submits with correct payload
- [ ] On 200 success, shows success screen → redirects to login
- [ ] On invalid OTP (400), shows error, allows retry
- [ ] Back/Change email links work correctly
- [ ] Works on mobile (responsive)

---

## Example State Structure (React)

```javascript
const [formData, setFormData] = useState({
  email: '',
  otp: '',
  newPassword: '',
  confirmPassword: ''
});

const [step, setStep] = useState(1); // 1 = email, 2 = reset

const [isLoading, setIsLoading] = useState(false);

const [error, setError] = useState(null);

const [resendCooldown, setResendCooldown] = useState(0);

const [isSuccess, setIsSuccess] = useState(false);
```

---

## Notes

- **No JWT needed** — these endpoints are public (no Authorization header)
- Backend returns **200 even for unregistered emails** — treat all 200 responses the same (show "check your email" message)
- **OTP is 6 digits numeric** — backend generates it; frontend only displays/accepts it
- **Password rules are strict** — enforce on client to reduce failed requests
- **Resend available after 60s** — implement countdown to improve UX
- **Redirect to login after success** — user must log in with new password

---

## Files to Create / Modify

Assuming React + React Router:

```
src/
  pages/
    ForgotPasswordPage.jsx   (or .tsx)
    ResetPasswordPage.jsx
    PasswordResetSuccess.jsx
  components/
    PasswordInput.jsx
    OtpInput.jsx
    CountdownButton.jsx
  hooks/
    useCountdown.js         (optional custom hook)
  services/
    authService.js          (axios calls)
  routes/
    AppRoutes.jsx            (add routes)
```

If using a different framework/structure, adapt accordingly.

---

## Quick Start Code Snippet (Minimal React Example)

```jsx
// ForgotPasswordPage.jsx
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/user/forgotPassword', { email });
      setSent(true);
      // Navigate to reset page after delay
      setTimeout(() => navigate('/reset-password?email=' + encodeURIComponent(email)), 2000);
    } catch (err) {
      if (err.response?.status === 403) {
        alert('Please verify your email first.');
      } else {
        alert('Something went wrong. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Forgot Password</h1>
      {sent ? (
        <p>Check your email for a 6-digit code.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      )}
    </div>
  );
}
```

---

## Final Requirement

Implement the complete password reset UI flow with proper loading states, validation, cooldown timer, error handling, and responsive design so that a user can go from "I forgot my password" to successfully setting a new password without writing any backend code.
