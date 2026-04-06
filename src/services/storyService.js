import { API_BASE_URL } from "../config";

export const uploadStory = async (file) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/stories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to upload story");
  }

  return raw;
};

export const getStories = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/stories`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to fetch stories");
  }

  return raw ? JSON.parse(raw) : [];
};

export const likeStory = async (storyId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/stories/${storyId}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to like story");
};

export const unlikeStory = async (storyId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/stories/${storyId}/like`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to unlike story");
};

export const viewStory = async (storyId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/stories/${storyId}/view`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to mark story as viewed");
};

export const getStoryInsights = async (storyId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/stories/${storyId}/insights`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to get insights");
  return res.json();
};