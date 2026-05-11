import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  registerUser,
  confirmEmail,
  resendOtp,
  verifyIdentity,
  loginUser,
  googleLogin,
  completeProfile,
  logoutUser,
  forgotPassword,
  resendResetPasswordOtp,
  resetPassword,
} from "../api/auth.api";

// Globally unpack potential backend validation arrays to provide explicitly clear UI toasting natively!
export const extractError = (error, fallback) => {
  if (!error?.response) {
    if (error?.code === "ERR_NETWORK") {
      return "Unable to reach the server. Check your connection and try again.";
    }
    return fallback;
  }

  const data = error.response.data;
  if (!data) return fallback;

  // Most explicit backend validators (like Joi/express-validator) bundle field issues securely inside lists.
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors[0].msg || data.errors[0].message || fallback;
  }
  if (Array.isArray(data.details) && data.details.length > 0) {
    return data.details[0].message || fallback;
  }

  // Standard nested message mappings strings
  if (typeof data.message === "string") {
    return data.message;
  }
  if (typeof data.error === "string") {
    return data.error;
  }

  return fallback;
};

/**
 * Maps login API errors to form fields (email, password) and an optional banner message.
 */
export const parseLoginApiError = (error) => {
  const fieldErrors = {};

  const pushItems = (items) => {
    if (!Array.isArray(items)) return;
    for (const item of items) {
      const msg = item?.msg ?? item?.message;
      if (!msg) continue;
      const raw = item.path ?? item.field ?? item.param ?? item.key;
      const key = (Array.isArray(raw) ? raw[0] : raw)
        ?.toString()
        ?.toLowerCase()
        ?.replace(/^\//, "");
      if (key === "email" || key === "password") {
        fieldErrors[key] = msg;
      }
    }
  };

  const data = error?.response?.data;
  if (data) {
    pushItems(data.errors);
    pushItems(data.details);
  }

  const topLevel =
    (typeof data?.message === "string" && data.message) ||
    (typeof data?.error === "string" && data.error) ||
    null;

  let rootMessage = topLevel;
  if (!rootMessage && Object.keys(fieldErrors).length === 0) {
    rootMessage = extractError(error, "Login failed");
  }

  return { fieldErrors, rootMessage };
};

export const useRegister = (options = {}) => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data, variables, context) => {
      const token = data?.token || data?.data?.token;
      const user =
        data?.user ||
        (data?.role ? data : data?.data?.user) ||
        data?.data ||
        data;

      setAuth(token, user);
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      } else {
        navigate("/verify-email");
      }
    },
    onError: (error, variables, context) => {
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
  });
};

export const useConfirmEmail = (options = {}) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: confirmEmail,
    onSuccess: (data, variables, context) => {
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      } else {
        navigate("/verify-identity");
      }
    },
    onError: (error, variables, context) => {
      if (options.onError) {
        options.onError(error, variables, context);
      } else {
        extractError(error, "Invalid OTP");
      }
    },
  });
};

export const useResendOtp = (options = {}) => {
  return useMutation({
    mutationFn: resendOtp,
    onSuccess: (data, variables, context) => {
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (options.onError) {
        options.onError(error, variables, context);
      } else {
        extractError(error, "Could not resend OTP");
      }
    },
  });
};

export const useVerifyIdentity = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: verifyIdentity,
    onSuccess: () => {
      if (user?.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/waiting");
      }
    },
    onError: (error) => {
      extractError(error, "Verification failed");
    },
  });
};

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Robustly extract token and user, regardless of backend wrapping
      const token = data?.token || data?.data?.token || data; // handle if data is just the token string
      let user =
        data?.user ||
        (data?.role ? data : data?.data?.user) ||
        data?.data ||
        (typeof data === "object" ? data : {});

      // Resolve token from the body to get the role
      if (typeof token === "string" && token.split(".").length === 3) {
        try {
          const decoded = JSON.parse(atob(token.split(".")[1]));
          user = { ...user, ...decoded };
        } catch (e) {
          console.error("Failed to decode token", e);
        }
      }

      setAuth(token, user);

      const role =
        typeof user?.role === "string" ? user.role.toLowerCase() : "";
      if (role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/waiting");
      }
    },
  });
};

export const useGoogleLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: googleLogin,
    onSuccess: (data) => {
      const token = data?.token || data?.data?.token || data;
      let user =
        data?.user ||
        (data?.role ? data : data?.data?.user) ||
        data?.data ||
        (typeof data === "object" ? data : {});

      if (typeof token === "string" && token.split(".").length === 3) {
        try {
          const decoded = JSON.parse(atob(token.split(".")[1]));
          user = { ...user, ...decoded };
        } catch (e) {
          console.error("Failed to decode token", e);
        }
      }

      setAuth(token, user);

      const role =
        typeof user?.role === "string" ? user.role.toLowerCase() : "";

      if (data?.needsPhoneNumber || data?.needsSSn) {
        navigate("/complete-profile");
      } else if (role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/waiting");
      }
    },
    onError: (error) => {
      const message = extractError(error, "Google login failed");
      toast.error(message);
    },
  });
};

export const useCompleteProfile = () => {
  const navigate = useNavigate();
  const updateUser = useAuthStore((state) => state.updateUser);
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: completeProfile,
    onSuccess: (data) => {
      updateUser(data);
      const updatedUser = { ...user, ...data };
      if (updatedUser?.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/waiting");
      }
    },
    onError: (error) => {
      extractError(error, "Failed to complete profile");
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {},
    onError: (error) => {
      extractError(error, "Logout failed");
    },
    onSettled: () => {
      clearAuth();
      navigate("/login");
    },
  });
};

// ── Password Reset Flow ──────────────────────────────────────
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
  });
};

export const useResendResetOtp = () => {
  return useMutation({
    mutationFn: resendResetPasswordOtp,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
  });
};
