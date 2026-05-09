import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  registerUser,
  confirmEmail,
  resendOtp,
  verifyIdentity,
  loginUser,
  googleLogin,
  completeProfile,
  forgotPassword,
  resetPassword,
  logoutUser,
} from '../api/auth.api';

// Globally unpack potential backend validation arrays to provide explicitly clear UI toasting natively!
export const extractError = (error, fallback) => {
  if (!error?.response) {
    if (error?.code === 'ERR_NETWORK') {
      return 'Unable to reach the server. Check your connection and try again.';
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
  if (typeof data.message === 'string') {
    return data.message;
  }
  if (typeof data.error === 'string') {
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
        ?.replace(/^\//, '');
      if (key === 'email' || key === 'password') {
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
    (typeof data?.message === 'string' && data.message) ||
    (typeof data?.error === 'string' && data.error) ||
    null;

  let rootMessage = topLevel;
  if (!rootMessage && Object.keys(fieldErrors).length === 0) {
    rootMessage = extractError(error, 'Login failed');
  }

  return { fieldErrors, rootMessage };
};

export const useRegister = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      const token = data?.token || data?.data?.token;
      const user = data?.user || (data?.role ? data : data?.data?.user) || data?.data || data;

      setAuth(token, user);
      navigate('/verify-email');
    },
    onError: (error) => {
    },
  });
};

export const useConfirmEmail = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: confirmEmail,
    onSuccess: () => {
      navigate('/verify-identity');
    },
    onError: (error) => {
      extractError(error, 'Invalid OTP');
    },
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: resendOtp,
    onSuccess: () => {
    },
    onError: (error) => {
      extractError(error, 'Could not resend OTP');
    },
  });
};

export const useVerifyIdentity = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: verifyIdentity,
    onSuccess: () => {
      if (user?.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/waiting');
      }
    },
    onError: (error) => {
      extractError(error, 'Verification failed');
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
      let user = data?.user || (data?.role ? data : data?.data?.user) || data?.data || (typeof data === 'object' ? data : {});

      // Resolve token from the body to get the role
      if (typeof token === 'string' && token.split('.').length === 3) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          user = { ...user, ...decoded };
        } catch (e) {
          console.error("Failed to decode token", e);
        }
      }

      setAuth(token, user);
      
      const role = typeof user?.role === 'string' ? user.role.toLowerCase() : '';
      if (role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/waiting');
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
      let user = data?.user || (data?.role ? data : data?.data?.user) || data?.data || (typeof data === 'object' ? data : {});

      if (typeof token === 'string' && token.split('.').length === 3) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          user = { ...user, ...decoded };
        } catch (e) {
          console.error("Failed to decode token", e);
        }
      }

      setAuth(token, user);
      
      const role = typeof user?.role === 'string' ? user.role.toLowerCase() : '';
      
      if (data?.needsPhoneNumber || data?.needsSSn) {
        navigate('/complete-profile');
      } else if (role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/waiting');
      }
    },
    onError: (error) => {
      extractError(error, 'Google login failed');
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
      if (updatedUser?.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/waiting');
      }
    },
    onError: (error) => {
      extractError(error, 'Failed to complete profile');
    },
  });
};

export const useForgotPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: (_data, email) => {
      navigate('/reset-password', { state: { email } });
    },
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      navigate('/login');
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
    },
    onError: (error) => {
      extractError(error, 'Logout failed');
    },
    onSettled: () => {
      clearAuth();
      navigate('/login');
    },
  });
};
