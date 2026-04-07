import { API_BASE_URL } from "../config";

const getUserEmail = () => {
  return localStorage.getItem("userEmail") || "";
};

export const toggleFollow = async (targetUserId) => {
  const userEmail = getUserEmail();

  const response = await fetch(
    `${API_BASE_URL}/follow/${targetUserId}?userEmail=${encodeURIComponent(userEmail)}`,
    {
      method: "POST",
    }
  );

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to toggle follow");
  }

  return raw;
};

export const getFollowers = async (userId) => {
  const userEmail = getUserEmail();
  const response = await fetch(
    `${API_BASE_URL}/follow/${userId}/followers?userEmail=${encodeURIComponent(userEmail)}`
  );
  if (!response.ok) throw new Error("Failed to fetch followers");
  return await response.json();
};

export const getFollowing = async (userId) => {
  const userEmail = getUserEmail();
  const response = await fetch(
    `${API_BASE_URL}/follow/${userId}/following?userEmail=${encodeURIComponent(userEmail)}`
  );
  if (!response.ok) throw new Error("Failed to fetch following");
  return await response.json();
};
