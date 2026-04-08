import { API_BASE_URL } from "../config";

const getUserEmail = () => {
  return localStorage.getItem("userEmail") || "";
};

const getToken = () => {
  return localStorage.getItem("token") || "";
};

export const getAllPosts = async () => {
  const userEmail = getUserEmail();

  const response = await fetch(
    `${API_BASE_URL}/posts?userEmail=${encodeURIComponent(userEmail)}`,
    {
      method: "GET",
    }
  );

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to fetch posts");
  }

  return raw ? JSON.parse(raw) : [];
};

export const getPostById = async (postId) => {
  const userEmail = getUserEmail();
  const response = await fetch(`${API_BASE_URL}/posts/${postId}?userEmail=${encodeURIComponent(userEmail)}`, {
    method: "GET"
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(raw || "Failed to fetch post");
  return raw ? JSON.parse(raw) : null;
};

export const createPost = async (content, imageFile) => {
  const userEmail = getUserEmail();

  const formData = new FormData();
  formData.append("content", content);
  formData.append("userEmail", userEmail);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    body: formData,
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to create post");
  }

  return raw;
};

export const deletePost = async (postId) => {
  const userEmail = getUserEmail();

  const response = await fetch(
    `${API_BASE_URL}/posts/${postId}?userEmail=${encodeURIComponent(userEmail)}`,
    {
      method: "DELETE",
    }
  );

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to delete post");
  }

  return raw;
};

export const addComment = async (postId, text) => {
  const userEmail = getUserEmail();

  const response = await fetch(`${API_BASE_URL}/comments/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, userEmail }),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to add comment");
  }

  return raw;
};

export const deleteComment = async (commentId) => {
  const userEmail = getUserEmail();

  const response = await fetch(
    `${API_BASE_URL}/comments/${commentId}?userEmail=${encodeURIComponent(userEmail)}`,
    {
      method: "DELETE",
    }
  );

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to delete comment");
  }

  return raw;
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

  return raw ? JSON.parse(raw) : {};
};