import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  connectChatSocket,
  deleteMessageForEveryone,
  deleteMessageForMe,
  getMessages,
  sendFileMessage,
  sendMessage,
  sendTypingStatus,
} from "../services/chatService";
import { getMyProfile } from "../services/userService";
import { API_BASE_URL } from "../config";

const ChatWindow = ({ selectedUser, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [typingText, setTypingText] = useState("");
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [menuMessageId, setMenuMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const selectedUserId = selectedUser?.userId;

  const userInitial = useMemo(() => {
    return selectedUser?.username
      ? selectedUser.username.charAt(0).toUpperCase()
      : "U";
  }, [selectedUser]);

  const loadCurrentUser = async () => {
    try {
      const me = await getMyProfile();
      setCurrentUserId(me.id);
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const loadMessages = async () => {
    if (!selectedUserId) return;

    try {
      setLoading(true);
      const data = await getMessages(selectedUserId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsSeen = async () => {
    if (!selectedUserId) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/chat/seen/${selectedUserId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    setMessages([]);
    setMessageText("");
    setTypingText("");
    setMenuMessageId(null);
    setIsOtherUserOnline(!!selectedUser?.online);

    if (selectedUserId) {
      loadMessages();
      markMessagesAsSeen();
    }
  }, [selectedUserId, selectedUser]);

  useEffect(() => {
    let isMounted = true;

    if (!currentUserId || !selectedUserId) return;

    const initSocket = async () => {
      try {
        await connectChatSocket({
          currentUserId,
          selectedUserId,
          onMessageReceived: () => {
            if (!isMounted) return;
            loadMessages();
          },
          onConversationRefresh: () => {
            if (!isMounted) return;
            if (onMessageSent) {
              onMessageSent();
            }
            loadMessages();
          },
          onTypingReceived: (payload) => {
            if (!isMounted) return;
            setTypingText(payload.typing ? `${payload.senderName} is typing...` : "");
          },
          onOnlineStatus: (payload) => {
            if (!isMounted) return;
            if (payload.userId === selectedUserId) {
              setIsOtherUserOnline(payload.online);
            }
          },
        });
      } catch (error) {
        console.error("Socket init error:", error);
      }
    };

    initSocket();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, selectedUserId, onMessageSent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingText]);

  useEffect(() => {
    const closeMenu = () => setMenuMessageId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const handleSendMessage = async () => {
    if (!selectedUserId || !messageText.trim()) return;

    try {
      setSending(true);
      await sendMessage(selectedUserId, messageText.trim());
      setMessageText("");
      await sendTypingStatus(selectedUserId, false);

      if (onMessageSent) {
        await onMessageSent();
      }

      await loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Message send failed");
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedUserId) return;

    try {
      setSending(true);
      await sendFileMessage(selectedUserId, file);

      if (onMessageSent) {
        await onMessageSent();
      }

      await loadMessages();
    } catch (error) {
      console.error("Error sending file:", error);
      alert(`File send failed: ${error.message}`);
    } finally {
      setSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleTypingChange = async (value) => {
    setMessageText(value);

    if (!selectedUserId) return;

    try {
      await sendTypingStatus(selectedUserId, true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(async () => {
        try {
          await sendTypingStatus(selectedUserId, false);
        } catch (error) {
          console.error("Typing error:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("Typing change error:", error);
    }
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      await deleteMessageForMe(messageId);
      setMenuMessageId(null);
      await loadMessages();
      if (onMessageSent) {
        await onMessageSent();
      }
    } catch (error) {
      console.error("Delete for me error:", error);
      alert("Delete for me failed");
    }
  };

  const handleDeleteForEveryone = async (messageId) => {
    try {
      await deleteMessageForEveryone(messageId);
      setMenuMessageId(null);
      await loadMessages();
      if (onMessageSent) {
        await onMessageSent();
      }
    } catch (error) {
      console.error("Delete for everyone error:", error);
      alert("Delete for everyone failed");
    }
  };

  const renderStatus = (message) => {
    if (!message.currentUserMessage) return null;
    if (message.status === "SEEN") return <span>✔✔</span>;
    if (message.status === "DELIVERED") return <span>✔✔</span>;
    return <span>✔</span>;
  };

  const renderMessageBody = (message) => {
    if (message.messageType === "IMAGE" && message.fileUrl) {
      return <img src={message.fileUrl} alt="chat" className="chat-image" />;
    }

    if (message.messageType === "FILE" && message.fileUrl) {
      return (
        <a
          href={message.fileUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            color: message.currentUserMessage ? "#ffffff" : "#2563eb",
            fontWeight: "700",
            wordBreak: "break-word",
          }}
        >
          📎 {message.fileName || "Download file"}
        </a>
      );
    }

    return <div>{message.messageText}</div>;
  };

  if (!selectedUser) {
    return (
      <div className="chat-window-card">
        <div className="empty-chat-box">
          <div>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>💬</div>
            <h2 style={{ marginBottom: "8px", color: "#1f2937" }}>Your Messages</h2>
            <p>Select a conversation to start chatting</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window-card">
      <div className="chat-window-shell">
        <div className="chat-window-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {selectedUser.profileImageUrl ? (
              <img
                src={selectedUser.profileImageUrl}
                alt={selectedUser.username}
                className="chat-user-avatar"
              />
            ) : (
              <div className="chat-user-avatar initial-avatar">{userInitial}</div>
            )}

            <div>
              <div style={{ fontSize: "16px", fontWeight: "700" }}>
                {selectedUser.username}
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                {typingText
                  ? typingText
                  : isOtherUserOnline
                  ? "Online"
                  : selectedUser.email}
              </div>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {loading ? (
            <div className="empty-chat-box">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="empty-chat-box">No messages yet. Say hello 👋</div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id || index}
                className="chat-row"
                style={{
                  justifyContent: message.currentUserMessage
                    ? "flex-end"
                    : "flex-start",
                }}
              >
                <div style={{ position: "relative", maxWidth: "75%" }}>
                  <div
                    className={`chat-bubble ${
                      message.currentUserMessage ? "mine" : "other"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuMessageId((prev) =>
                        prev === message.id ? null : message.id
                      );
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {renderMessageBody(message)}

                    <div className="chat-meta">
                      <span>
                        {message.createdAt
                          ? message.createdAt.replace("T", " ").slice(0, 16)
                          : ""}
                      </span>
                      {renderStatus(message)}
                    </div>
                  </div>

                  {menuMessageId === message.id && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: message.currentUserMessage ? 0 : "auto",
                        left: message.currentUserMessage ? "auto" : 0,
                        marginTop: "6px",
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
                        padding: "6px",
                        zIndex: 10,
                        minWidth: "170px",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        style={{
                          width: "100%",
                          border: "none",
                          background: "transparent",
                          textAlign: "left",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleDeleteForMe(message.id)}
                      >
                        Delete for me
                      </button>

                      {message.currentUserMessage && (
                        <button
                          style={{
                            width: "100%",
                            border: "none",
                            background: "transparent",
                            textAlign: "left",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            color: "#dc2626",
                            fontWeight: "600",
                          }}
                          onClick={() => handleDeleteForEveryone(message.id)}
                        >
                          Delete for everyone
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-bar">
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          <button
            type="button"
            className="chat-attach-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            📎
          </button>

          <input
            className="chat-input"
            type="text"
            placeholder={`Message ${selectedUser.username}...`}
            value={messageText}
            onChange={(e) => handleTypingChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />

          <button
            className="chat-send-btn"
            onClick={handleSendMessage}
            disabled={sending}
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;