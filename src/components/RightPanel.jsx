import React, { useEffect, useState } from "react";
import { getSuggestedUsers } from "../services/userService";
import { toggleFollow } from "../services/followService";
import { resolveMediaUrl } from "../utils/media";

const RightPanel = ({ onUserClick, onMessageUser }) => {
  const [users, setUsers] = useState([]);

  const loadSuggestions = async () => {
    try {
      const data = await getSuggestedUsers();
      const normalized = Array.isArray(data)
        ? data.map((user) => ({
            ...user,
            profileImageUrl: resolveMediaUrl(user.profileImageUrl),
          }))
        : [];
      setUsers(normalized);
    } catch (error) {
      console.error("Suggestions error:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleFollow = async (userId) => {
    try {
      await toggleFollow(userId);
      await loadSuggestions();
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Suggested for you</h3>

      {users.length === 0 ? (
        <div style={styles.empty}>No suggestions</div>
      ) : (
        users.map((user) => (
          <div key={user.id} style={styles.userRow}>
            <div
              style={styles.userLeft}
              onClick={() => onUserClick && onUserClick(user.id)}
            >
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.username}
                  style={styles.avatar}
                />
              ) : (
                <div style={styles.avatarFallback}>
                  {user.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}

              <div style={{ minWidth: 0 }}>
                <div style={styles.name}>{user.username}</div>
              </div>
            </div>

            <div style={styles.actions}>
              <button
                style={styles.profileBtn}
                onClick={() => onUserClick && onUserClick(user.id)}
              >
                Profile
              </button>

              <button
                style={styles.messageBtn}
                onClick={() =>
                  onMessageUser &&
                  onMessageUser({
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    profileImageUrl: user.profileImageUrl,
                  })
                }
              >
                Message
              </button>

              <button
                style={styles.followBtn}
                onClick={() => handleFollow(user.id)}
              >
                {user.followedByCurrentUser ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  card: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    borderRadius: "24px",
    padding: "18px",
    maxHeight: "calc(100vh - 120px)",
    overflowY: "auto",
    scrollbarWidth: "none",
    boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
  },

  title: {
    margin: "0 0 14px 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#1f2937",
  },

  empty: {
    color: "#6b7280",
    fontSize: "14px",
  },

  userRow: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "12px 0",
    borderBottom: "1px solid #f1f5f9",
  },

  userLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    minWidth: 0,
  },

  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  },

  avatarFallback: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    flexShrink: 0,
  },

  name: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1f2937",
    wordBreak: "break-word",
  },

  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  profileBtn: {
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "7px 10px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  messageBtn: {
    border: "1px solid #ddd6fe",
    background: "#f5f3ff",
    color: "#6d28d9",
    padding: "7px 10px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  followBtn: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "7px 10px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
  },
};

export default RightPanel;