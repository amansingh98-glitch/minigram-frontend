import { API_BASE_URL } from "../config";

export const toggleLike = async (postId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/likes/toggle/${postId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to toggle like");
  }

  return raw ? JSON.parse(raw) : {};
};