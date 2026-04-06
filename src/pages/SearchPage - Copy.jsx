import React, { useEffect, useState } from "react";
import { searchUsers } from "../services/userService";
import { toggleFollow } from "../services/followService";
import { resolveMediaUrl } from "../utils/media";

const SearchPage = ({ onUserClick, onMessageUser }) => {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = async (value) => {
    setKeyword(value);

    try {
      if (!value.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      const data = await searchUsers(value);

      const normalized = Array.isArray(data)
        ? data.map((user) => ({
            ...user,
            profileImageUrl: resolveMediaUrl(user.profileImageUrl),
          }))
        : [];

      setUsers(normalized);
    } catch (error) {
      console.error("Search error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId) => {
    try {
      await toggleFollow(userId);

      const updated = await searchUsers(keyword);
      const normalized = Array.isArray(updated)
        ? updated.map((user) => ({
            ...user,
            profileImageUrl: resolveMediaUrl(user.profileImageUrl),
          }))
        : [];

      setUsers(normalized);
    } catch (error) {
      console.error("Follow toggle error:", error);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerCard}>
        <h2 style={{ ...styles.title, fontSize: isMobile ? "22px" : "28px" }}>
          Search Users
        </h2>
        <p style={styles.subtitle}>
          Find people by username and open their profile.
        </p>

        <input
          type="text"
          placeholder="Search by username..."
          value={keyword}
          onChange={(e) => handleSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {loading ? (
        <div style={styles.infoCard}>Searching...</div>
      ) : users.length === 0 ? (
        <div style={styles.infoCard}>
          {keyword.trim() ? "No users found" : "Start typing to search users"}
        </div>
      ) : (
        <div style={styles.list}>
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                ...styles.userCard,
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
              }}
            >
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
                  <div style={styles.avatarPlaceholder}>
                    {user.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}

                <div style={{ minWidth: 0 }}>
                  <div style={styles.userName}>{user.username}</div>
                  <div style={styles.userEmail}>{user.email}</div>
                </div>
              </div>

              <div
                style={{
                  ...styles.userActions,
                  width: isMobile ? "100%" : "auto",
                }}
              >
                <button
                  style={styles.followBtn}
                  onClick={() => handleFollowToggle(user.id)}
                >
                  {user.followedByCurrentUser ? "Following" : "Follow"}
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    width: "100%",
  },
  headerCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    padding: "20px",
  },
  title: {
    margin: 0,
    fontWeight: "700",
    color: "#1f2937",
  },
  subtitle: {
    margin: "8px 0 14px 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  searchInput: {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "14px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },
  infoCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "20px",
    color: "#6b7280",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  userCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "16px",
  },
  userLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
    cursor: "pointer",
    flex: 1,
  },
  avatar: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  },
  avatarPlaceholder: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    flexShrink: 0,
  },
  userName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1f2937",
    wordBreak: "break-word",
  },
  userEmail: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "4px",
    wordBreak: "break-word",
  },
  userActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  followBtn: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
  },
  messageBtn: {
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
  },
};

export default SearchPage;