import { API_BASE_URL } from "../config";

export const deletePost = async (postId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to delete post");
  }

  return raw;
};

export const deleteComment = async (commentId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to delete comment");
  }

  return raw;
};

export const createPost = async (content, imageFile) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("content", content);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to create post");
  }

  return raw;
};

export const getAllPosts = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to fetch posts");
  }

  return raw ? JSON.parse(raw) : [];
};

export const addComment = async (postId, text) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/comments/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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