import { API_BASE_URL } from "../config";

const getUserEmail = () => {
  return localStorage.getItem("userEmail") || "";
};

export const toggleLike = async (postId) => {
  const userEmail = getUserEmail();

  const response = await fetch(
    `${API_BASE_URL}/likes/toggle/${postId}?userEmail=${encodeURIComponent(userEmail)}`,
    {
      method: "POST",
    }
  );

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to toggle like");
  }

  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};