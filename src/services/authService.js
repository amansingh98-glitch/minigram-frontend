import { API_BASE_URL } from "../config";

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Register failed");
  }

  return raw;
};

export const loginUser = async (loginData) => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Login failed");
  }

  const data = raw ? JSON.parse(raw) : {};

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  if (data.email) {
    localStorage.setItem("userEmail", data.email);
  }

  if (data.username) {
    localStorage.setItem("username", data.username);
  }

  if (data.profileImageUrl) {
    localStorage.setItem("profileImageUrl", data.profileImageUrl);
  }

  return data;
};