import { API_BASE_URL } from "../config";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const parseJsonSafely = (raw) => {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

export const deletePost = async (postId) => {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to delete post");
  }

  return raw;
};

export const deleteComment = async (commentId) => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to delete comment");
  }

  return raw;
};

export const createPost = async (content, imageFile) => {
  const formData = new FormData();
  formData.append("content", content);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to create post");
  }

  return raw;
};

export const getAllPosts = async () => {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to fetch posts");
  }

  const data = parseJsonSafely(raw);
  return data || [];
};

export const addComment = async (postId, text) => {
  const response = await fetch(`${API_BASE_URL}/comments/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ text }),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to add comment");
  }

  return raw;
};

export const toggleLike = async (postId) => {
  const response = await fetch(`${API_BASE_URL}/likes/toggle/${postId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to toggle like");
  }

  const data = parseJsonSafely(raw);
  return data || {};
};