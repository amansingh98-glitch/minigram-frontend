import { API_BASE_URL } from "../config";

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return response.text();
};

export const loginUser = async (loginData) => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  return response.json();
};

export const sendForgotPasswordOtp = async (email) => {
  const response = await fetch(`${API_BASE_URL}/users/forgot-password/send-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to send OTP");
  }

  return raw;
};

export const resetPasswordWithOtp = async ({ email, otp, newPassword }) => {
  const response = await fetch(`${API_BASE_URL}/users/forgot-password/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to reset password");
  }

  return raw;
};