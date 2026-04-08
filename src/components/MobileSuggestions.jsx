import React, { useEffect, useState } from "react";
import { getSuggestedUsers } from "../services/userService";
import { toggleFollow } from "../services/followService";
import { resolveMediaUrl } from "../utils/media";

const MobileSuggestions = ({ onUserClick }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleFollow = async (e, userId) => {
    e.stopPropagation();
    try {
      await toggleFollow(userId);
      await loadSuggestions();
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  if (loading && users.length === 0) return null;
  if (users.length === 0) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Suggested for you</span>
        <span style={styles.seeAll}>See All</span>
      </div>
      <div style={styles.scrollArea}>
        {users.map((user) => (
          <div 
            key={user.id} 
            style={styles.card}
            onClick={() => onUserClick && onUserClick(user.id)}
          >
            <div style={styles.avatarWrapper}>
              <div style={styles.ring}>
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt={user.username} style={styles.avatar} />
                ) : (
                  <div style={styles.avatarFallback}>
                    {user.username?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <span style={styles.username}>{user.username}</span>
            <button 
              style={{
                ...styles.followBtn,
                background: user.followedByCurrentUser ? "#f3f4f6" : "#2563eb",
                color: user.followedByCurrentUser ? "#6b7280" : "#fff",
              }}
              onClick={(e) => handleFollow(e, user.id)}
            >
              {user.followedByCurrentUser ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    margin: "10px 0 20px 0",
    padding: "16px 0",
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(12px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 16px 12px 16px",
  },
  title: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1f2937",
  },
  seeAll: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#2563eb",
  },
  scrollArea: {
    display: "flex",
    overflowX: "auto",
    padding: "0 12px",
    gap: "12px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  card: {
    minWidth: "110px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#fff",
    padding: "12px 8px",
    borderRadius: "20px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 10px rgba(0,0,0,0.02)",
    cursor: "pointer",
  },
  avatarWrapper: {
    marginBottom: "8px",
  },
  ring: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
    padding: "2px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #fff",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "18px",
    border: "2px solid #fff",
  },
  username: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#374151",
    marginBottom: "8px",
    width: "80px",
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  followBtn: {
    padding: "4px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
    width: "100%",
  },
};

export default MobileSuggestions;
