import { Client } from "@stomp/stompjs";
import { API_BASE_URL } from "../config";

let stompClient = null;
let activeChatKey = null;
let isConnecting = false;

let globalStompClient = null;

// Mutable listeners object to avoid stale React closures
const chatListeners = {
  onMessageReceived: null,
  onConversationRefresh: null,
  onTypingReceived: null,
  onOnlineStatus: null,
};

const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");

export const getConversations = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to fetch conversations");
  }

  return raw ? JSON.parse(raw) : [];
};

export const getMessages = async (otherUserId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/chat/messages/${otherUserId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to fetch messages");
  }

  return raw ? JSON.parse(raw) : [];
};

export const sendMessage = async (receiverId, messageText, replyToMessageId = null) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/chat/send/${receiverId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messageText, replyToMessageId }),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to send message");
  }

  return raw ? JSON.parse(raw) : {};
};

export const sendFileMessage = async (receiverId, file) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/chat/send-file/${receiverId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to send file");
  }

  return raw ? JSON.parse(raw) : {};
};

export const sendTypingStatus = async (receiverId, typing) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/chat/typing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      receiverId,
      typing,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send typing status");
  }
};

export const setOnline = async () => {
  const token = localStorage.getItem("token");

  await fetch(`${API_BASE_URL}/chat/online`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const setOffline = async () => {
  const token = localStorage.getItem("token");

  await fetch(`${API_BASE_URL}/chat/offline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const reactToMessage = async (messageId, reaction) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/chat/messages/${messageId}/react?reaction=${encodeURIComponent(reaction)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to send reaction");
  }

  return raw ? JSON.parse(raw) : {};
};

export const deleteMessageForMe = async (messageId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/chat/delete-for-me/${messageId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to delete message for me");
  }

  return raw;
};

export const deleteMessageForEveryone = async (messageId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/chat/delete-for-everyone/${messageId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to delete message for everyone");
  }

  return raw;
};

export const deleteConversation = async (otherUserId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/chat/delete-conversation/${otherUserId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(raw || "Failed to delete conversation");
  }

  return raw;
};

export const connectChatSocket = async ({
  currentUserId,
  selectedUserId,
  onMessageReceived,
  onConversationRefresh,
  onTypingReceived,
  onOnlineStatus,
}) => {
  if (!currentUserId || !selectedUserId) return null;

  // Always update listeners to the latest React render closure
  chatListeners.onMessageReceived = onMessageReceived;
  chatListeners.onConversationRefresh = onConversationRefresh;
  chatListeners.onTypingReceived = onTypingReceived;
  chatListeners.onOnlineStatus = onOnlineStatus;

  const nextChatKey = `${currentUserId}-${selectedUserId}`;

  if (stompClient?.connected && activeChatKey === nextChatKey) {
    return stompClient;
  }

  if (isConnecting && activeChatKey === nextChatKey) {
    return stompClient;
  }

  if (stompClient && activeChatKey !== nextChatKey) {
    try {
      await stompClient.deactivate();
    } catch (e) {
      console.error("Socket deactivate error:", e);
    }
    stompClient = null;
    activeChatKey = null;
  }

  isConnecting = true;
  activeChatKey = nextChatKey;

  const client = new Client({
    brokerURL: `${WS_BASE_URL}/ws-chat`,
    reconnectDelay: 2000,
    heartbeatIncoming: 10000, // Important for Render.com to keep connection alive
    heartbeatOutgoing: 10000,
    debug: () => {},
  });

  client.onConnect = () => {
    isConnecting = false;
    console.log("WebSocket connected successfully to /ws-chat");

    client.subscribe(`/topic/chat/${currentUserId}/${selectedUserId}`, (message) => {
      const payload = JSON.parse(message.body);
      if (chatListeners.onMessageReceived) {
        chatListeners.onMessageReceived(payload);
      }
    });

    client.subscribe(`/topic/conversations/${currentUserId}`, () => {
      if (chatListeners.onConversationRefresh) {
        chatListeners.onConversationRefresh();
      }
    });

    client.subscribe(`/topic/typing/${currentUserId}/${selectedUserId}`, (message) => {
      const payload = JSON.parse(message.body);
      if (chatListeners.onTypingReceived) {
        chatListeners.onTypingReceived(payload);
      }
    });

    client.subscribe(`/topic/online-status`, (message) => {
      const payload = JSON.parse(message.body);
      if (chatListeners.onOnlineStatus) {
        chatListeners.onOnlineStatus(payload);
      }
    });
  };

  client.onStompError = (frame) => {
    isConnecting = false;
    console.error("STOMP error details:", frame);
  };

  client.onWebSocketError = (error) => {
    isConnecting = false;
    console.error("WebSocket error:", error);
  };

  client.onWebSocketClose = () => {
    isConnecting = false;
  };

  stompClient = client;
  client.activate();

  return client;
};

export const disconnectChatSocket = async () => {
  if (stompClient) {
    try {
      await stompClient.deactivate();
    } catch (e) {
      console.error("Socket disconnect error:", e);
    }
  }

  stompClient = null;
  activeChatKey = null;
  isConnecting = false;
};

export const connectGlobalSocket = (currentUserId, onNotificationReceived) => {
  if (!currentUserId) return;

  if (globalStompClient?.connected) {
    return globalStompClient;
  }

  const client = new Client({
    brokerURL: `${WS_BASE_URL}/ws-chat`,
    reconnectDelay: 2000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: () => {},
  });

  client.onConnect = () => {
    client.subscribe(`/topic/notifications/${currentUserId}`, (message) => {
      const payload = JSON.parse(message.body);
      if (onNotificationReceived) {
        onNotificationReceived(payload);
      }
    });
  };

  client.onStompError = (frame) => {
    console.error("Global STOMP error:", frame);
  };

  globalStompClient = client;
  client.activate();
  return client;
};

export const disconnectGlobalSocket = async () => {
  if (globalStompClient) {
    try {
      await globalStompClient.deactivate();
    } catch (e) {
      console.error("Global socket disconnect error:", e);
    }
    globalStompClient = null;
  }
};