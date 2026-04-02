import { API_BASE_URL } from "../config";

export const getMyProfile = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch my profile");
  }

  return response.json();
};

export const getUserProfile = async (userId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return response.json();
};

export const editProfile = async ({ username, bio }) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/users/edit-profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username, bio }),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to update profile");
  }

  return raw;
};

export const uploadProfileImage = async (imageFile) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(`${API_BASE_URL}/users/profile-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload profile image");
  }

  return response.text();
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