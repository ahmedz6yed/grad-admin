import axiosInstance from "./axiosInstance";

/** Throws a shape react-query + extractError understand when body status is not success. */
const assertSuccessBody = (data) => {
  const status = data?.status;
  if (status && status !== "success") {
    const err = new Error(
      typeof data?.message === "string" ? data.message : "Request failed",
    );
    err.response = { data };
    throw err;
  }
};

export const registerUser = async (data) => {
  const res = await axiosInstance.post("user/register", data);
  return res.data;
};

export const confirmEmail = async (otp) => {
  const res = await axiosInstance.post("user/confirmEmail", { otp });
  return res.data;
};

export const resendOtp = async () => {
  const res = await axiosInstance.post("user/resend-confirmation-otp");
  return res.data;
};

export const verifyIdentity = async (formData) => {
  const res = await axiosInstance.post("user/verify-identity", formData);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await axiosInstance.post("user/login", data);
  return res.data;
};

export const googleLogin = async (googleToken) => {
  const res = await axiosInstance.post("user/google", { token: googleToken });
  return res.data;
};

export const completeProfile = async (data) => {
  const res = await axiosInstance.post("user/completeProfile", data);
  return res.data;
};

export const logoutUser = async () => {
  const res = await axiosInstance.post("user/logout");
  return res.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axiosInstance.post("user/upload", formData);
  return res.data;
};

// ── Password Reset Flow ──────────────────────────────────────
export const forgotPassword = async (email) => {
  const res = await axiosInstance.post("user/forgotPassword", { email });
  return res.data;
};

export const resendResetPasswordOtp = async (email) => {
  const res = await axiosInstance.post("user/resend-resetpassword-otp", {
    email,
  });
  return res.data;
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const res = await axiosInstance.post("user/resetPassword", {
    email,
    otp,
    newPassword,
  });
  return res.data;
};
