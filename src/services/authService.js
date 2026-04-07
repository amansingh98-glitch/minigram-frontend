import { API_BASE_URL } from "../config";

const handleResponse = async (response) => {
  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    data = raw;
  }

  if (!response.ok) {
    const errorMsg = (typeof data === 'object' && data.message) ? data.message : (typeof data === 'string' ? data : "An unexpected error occurred");
    throw new Error(errorMsg);
  }
  return data;
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const loginUser = async (loginData) => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData),
  });

  const data = await handleResponse(response);

  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  if (data.email) {
    localStorage.setItem("userEmail", data.email);
  } else if (loginData.email) {
    localStorage.setItem("userEmail", loginData.email);
  }
  if (data.username) {
    localStorage.setItem("username", data.username);
  }
  if (data.profileImageUrl) {
    localStorage.setItem("profileImageUrl", data.profileImageUrl);
  }

  return data;
};

export const sendForgotPasswordOtp = async (email) => {
  const response = await fetch(`${API_BASE_URL}/users/forgot-password/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

export const resetPasswordWithOtp = async ({ email, otp, newPassword }) => {
  const response = await fetch(`${API_BASE_URL}/users/forgot-password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword }),
  });
  return handleResponse(response);
};

export const verifyRegistrationOtp = async (email, otp) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  return handleResponse(response);
};

export const resendVerificationOtp = async (email) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};