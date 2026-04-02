import React, { useEffect, useState } from "react";
import { getSuggestedUsers } from "../services/userService";
import { toggleFollow } from "../services/followService";

const RightPanel = ({ onUserClick, onMessageUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState({});

  const loadSuggestedUsers = async () => {
    try {
      setLoading(true);
      const data = await getSuggestedUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading suggested users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestedUsers();
  }, []);

  const handleFollowToggle = async (userId) => {
    try {
      setFollowLoading((prev) => ({
        ...prev,
        [userId]: true,
      }));

      const result = await toggleFollow(userId);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                followedByCurrentUser:
                  typeof result.following === "boolean"
                    ? result.following
                    : !user.followedByCurrentUser,
              }
            : user
        )
      );
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading((prev) => ({
        ...prev,
        [userId]: false,
      }));
    }
  };

  return (
    <div style={styles.panel}>
      <h3 style={styles.heading}>Suggested for you</h3>

      {loading ? (
        <p style={styles.infoText}>Loading suggestions...</p>
      ) : users.length === 0 ? (
        <p style={styles.infoText}>No suggestions available</p>
      ) : (
        <div style={styles.userList}>
          {users.map((user) => {
            const initial = user.username
              ? user.username.charAt(0).toUpperCase()
              : "U";

            return (
              <div key={user.id} style={styles.userCard}>
                <div
                  style={styles.userLeft}
                  onClick={() => onUserClick && onUserClick(user.id)}
                >
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.username}
                      style={styles.userImage}
                    />
                  ) : (
                    <div style={styles.userAvatar}>{initial}</div>
                  )}

                  <div style={{ minWidth: 0 }}>
                    <div style={styles.userName}>{user.username}</div>
                    <div style={styles.userEmail}>{user.email}</div>
                  </div>
                </div>

                <div style={styles.actionColumn}>
                  <button
                    style={styles.profileButton}
                    onClick={() => onUserClick && onUserClick(user.id)}
                  >
                    Profile
                  </button>

                  <button
                    style={styles.messageButton}
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
                    style={{
                      ...styles.followButton,
                      ...(user.followedByCurrentUser ? styles.followingButton : {}),
                    }}
                    onClick={() => handleFollowToggle(user.id)}
                    disabled={followLoading[user.id]}
                  >
                    {followLoading[user.id]
                      ? "..."
                      : user.followedByCurrentUser
                      ? "Following"
                      : "Follow"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  panel: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    position: "sticky",
    top: "104px",
  },

  heading: {
    margin: "0 0 18px 0",
    fontSize: "18px",
    color: "#1f2937",
  },

  infoText: {
    color: "#6b7280",
    fontSize: "14px",
    margin: 0,
  },

  userList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  userCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  userLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    minWidth: 0,
    flex: 1,
  },

  userImage: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #d1d5db",
    flexShrink: 0,
  },

  userAvatar: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "18px",
    flexShrink: 0,
  },

  userName: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1f2937",
  },

  userEmail: {
    fontSize: "13px",
    color: "#6b7280",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "140px",
  },

  actionColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flexShrink: 0,
  },

  profileButton: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    padding: "7px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },

  messageButton: {
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "7px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },

  followButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "8px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
  },

  followingButton: {
    background: "#111827",
  },
};

export default RightPanel;