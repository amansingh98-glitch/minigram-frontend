import { API_BASE_URL } from "../config";

export const getNotifications = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/notifications`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json();
};

export const getUnreadNotificationCount = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch unread notification count");
  }

  return response.json();
};

export const markNotificationsAsRead = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/notifications/mark-read`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to mark notifications as read");
  }

  return response.text();
};