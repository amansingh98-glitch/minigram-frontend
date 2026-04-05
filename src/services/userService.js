import { API_BASE_URL } from "../config";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getMyProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: getAuthHeader(),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(raw || "Failed to fetch my profile");
  }

  return raw ? JSON.parse(raw) : null;
};

export const getUserProfile = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    headers: getAuthHeader(),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(raw || "Failed to fetch user profile");
  }

  return raw ? JSON.parse(raw) : null;
};

export const editProfile = async (data) => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(raw || "Failed to update profile");
  }

  return raw;
};

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/users/profile/image`, {
    method: "POST",
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(raw || "Failed to upload profile image");
  }

  return raw;
};

export const getSuggestedUsers = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/users/suggestions`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch suggested users");
  }

  return response.json();
};

export const changePassword = async (oldPassword, newPassword) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/users/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to change password");
  }

  return raw;
};

export const deleteAccount = async (password) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/users/delete-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to delete account");
  }

  return raw;
};

export const searchUsers = async (keyword) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/users/search?keyword=${encodeURIComponent(keyword)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to search users");
  }

  return response.json();
};