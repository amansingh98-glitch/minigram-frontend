const SearchPage = ({ onUserClick, onMessageUser }) => {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

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
          <span style={styles.glowIcon}>✨</span>
        </div>
        <p style={styles.subtitle}>Discover interesting people and connect globally.</p>
        
        <div style={styles.searchBarWrapper}>
          <div style={styles.searchIcon}>🔍</div>
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
              <div key={user.id} style={styles.userCard}>
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
  container: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "40px", 
    maxWidth: "1000px", 
    margin: "0 auto",
    padding: "0 20px"
  },
  searchHeader: {
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "32px",
    padding: "40px",
    border: "1px solid rgba(255,255,255,0.4)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.02)",
    marginBottom: "10px"
  },
  searchTitleRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" },
  title: { margin: 0, fontSize: "32px", fontWeight: "900", color: "#111827", letterSpacing: "-1.5px" },
  glowIcon: { fontSize: "28px", animation: "glowPulse 2s infinite" },
  subtitle: { margin: 0, color: "#64748b", fontSize: "17px", marginBottom: "32px", fontWeight: "500" },
  searchBarWrapper: { position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: "20px", fontSize: "18px", color: "#94a3b8" },
  searchInput: {
    width: "100%",
    padding: "18px 20px 18px 52px",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
  },
  resultArea: { minHeight: "200px" },
  infoBox: { textAlign: "center", padding: "60px", color: "#94a3b8", fontStyle: "italic", fontWeight: "500" },
  grid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
    gap: "24px",
    animation: "fadeIn 0.5s ease"
  },
  userCard: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    borderRadius: "28px",
    padding: "24px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.02)",
    cursor: "default",
  },
  cardHeader: { display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" },
  avatar: { 
    width: "64px", 
    height: "64px", 
    borderRadius: "20px", 
    objectFit: "cover",
    boxShadow: "0 8px 16px rgba(0,0,0,0.05)"
  },
  avatarInitial: {
    width: "64px", height: "64px", borderRadius: "20px", 
    background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
    color: "#2563eb", display: "flex", alignItems: "center", 
    justifyContent: "center", fontWeight: "900", fontSize: "24px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.05)"
  },
  userInfo: { minWidth: 0, flex: 1 },
  userName: { fontWeight: "800", color: "#111827", fontSize: "17px", marginBottom: "2px" },
  userBio: { fontSize: "13px", color: "#64748b", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  actions: { display: "flex", gap: "12px" },
  followBtn: { 
    flex: 1, padding: "12px", borderRadius: "14px", border: "none", 
    background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#fff", 
    fontWeight: "800", cursor: "pointer", fontSize: "13px",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
    transition: "all 0.3s ease"
  },
  followingBtn: { 
    flex: 1, padding: "12px", borderRadius: "14px", border: "1px solid #e2e8f0", 
    background: "#fff", color: "#475569", fontWeight: "800", cursor: "pointer", fontSize: "13px" 
  },
  messageBtn: { 
    flex: 1, padding: "12px", borderRadius: "14px", 
    border: "1px solid rgba(124, 58, 237, 0.1)", 
    background: "rgba(124, 58, 237, 0.05)", color: "#7c3aed", 
    fontWeight: "800", cursor: "pointer", fontSize: "13px" 
  }
};

export default SearchPage;