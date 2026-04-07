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

  const handleSearch = async (val) => {
    setKeyword(val);
    if (!val.trim()) { setUsers([]); return; }
    try {
      setLoading(true);
      const data = await searchUsers(val);
      setUsers(Array.isArray(data) ? data.map(u => ({
        ...u,
        profileImageUrl: resolveMediaUrl(u.profileImageUrl),
      })) : []);
    } catch (e) {
      console.error(e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (id) => {
    try {
      await toggleFollow(id);
      handleSearch(keyword);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.searchHeader}>
        <div style={styles.searchTitleRow}>
          <h2 style={styles.title}>Explore Community</h2>
          <span style={styles.icon}>🔍</span>
        </div>
        <p style={styles.subtitle}>Discover interesting people and connect globally.</p>
        
        <div style={styles.searchBarWrapper}>
          <input
            type="text"
            placeholder="Search by username..."
            value={keyword}
            onChange={(e) => handleSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.resultArea}>
        {loading ? (
          <div style={styles.infoBox}>✨ Polishing results...</div>
        ) : users.length === 0 ? (
          <div style={styles.infoBox}>
            {keyword.trim() ? "No users found" : "Type to discover new accounts"}
          </div>
        ) : (
          <div style={styles.grid}>
            {users.map((user) => (
              <div key={user.id} style={styles.userCard} className="settings-card">
                <div style={styles.cardHeader} onClick={() => onUserClick && onUserClick(user.id)}>
                  {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} style={styles.avatar} alt="u" />
                  ) : (
                    <div style={styles.avatarInitial}>{user.username?.charAt(0).toUpperCase()}</div>
                  )}
                  <div style={styles.userInfo}>
                    <div style={styles.userName}>{user.username}</div>
                    <div style={styles.userBio}>{user.email}</div>
                  </div>
                </div>

                <div style={styles.actions}>
                  <button
                    style={user.followedByCurrentUser ? styles.followingBtn : styles.followBtn}
                    onClick={() => handleFollowToggle(user.id)}
                  >
                    {user.followedByCurrentUser ? "Following" : "Follow"}
                  </button>
                  <button
                    style={styles.messageBtn}
                    onClick={() => onMessageUser && onMessageUser(user)}
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", flexDirection: "column", gap: "30px", maxWidth: "900px", margin: "0 auto" },
  searchHeader: {
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: "28px",
    padding: "32px",
    border: "1px solid rgba(255,255,255,0.3)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)"
  },
  searchTitleRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" },
  title: { margin: 0, fontSize: "28px", fontWeight: "800", color: "#111827", letterSpacing: "-1px" },
  icon: { fontSize: "24px" },
  subtitle: { margin: 0, color: "#6b7280", fontSize: "16px", marginBottom: "24px" },
  searchBarWrapper: { position: "relative" },
  searchInput: {
    width: "100%",
    padding: "16px 20px",
    borderRadius: "18px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    ":focus": { borderColor: "#2563eb", boxShadow: "0 0 0 4px rgba(37,99,235,0.1)" }
  },
  resultArea: { minHeight: "200px" },
  infoBox: { textAlign: "center", padding: "40px", color: "#9ca3af", fontStyle: "italic" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" },
  userCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "20px",
    border: "1px solid #f3f4f6",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    transition: "all 0.3s ease"
  },
  cardHeader: { display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" },
  avatar: { width: "56px", height: "56px", borderRadius: "18px", objectFit: "cover" },
  avatarInitial: {
    width: "56px", height: "56px", borderRadius: "18px", background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
    color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "22px"
  },
  userInfo: { minWidth: 0 },
  userName: { fontWeight: "700", color: "#111827", fontSize: "16px" },
  userBio: { fontSize: "12px", color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  actions: { display: "flex", gap: "10px" },
  followBtn: { flex: 1, padding: "10px", borderRadius: "12px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", cursor: "pointer" },
  followingBtn: { flex: 1, padding: "10px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151", fontWeight: "700", cursor: "pointer" },
  messageBtn: { flex: 1, padding: "10px", borderRadius: "12px", border: "1px solid rgba(139, 92, 246, 0.2)", background: "rgba(139, 92, 246, 0.05)", color: "#7c3aed", fontWeight: "700", cursor: "pointer" }
};

export default SearchPage;