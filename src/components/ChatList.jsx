import React from "react";

const ChatList = ({ conversations = [], selectedUser, onSelectUser }) => {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Messages</h2>
        <div style={styles.badge}>{conversations.length}</div>
      </div>

      <div style={styles.body}>
        {conversations.length === 0 ? (
          <div style={styles.empty}>No conversations yet</div>
        ) : (
          conversations.map((user) => {
            const isActive = selectedUser?.userId === user.userId;
            return (
              <div
                key={user.userId}
                style={{
                  ...styles.userItem,
                  background: isActive ? "rgba(37, 99, 235, 0.08)" : "transparent",
                  borderLeft: isActive ? "4px solid #2563eb" : "4px solid transparent",
                }}
                onClick={() => onSelectUser(user)}
              >
                <div style={styles.avatarWrapper}>
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
                  {user.online && <div style={styles.onlineStatus} />}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ ...styles.userName, color: isActive ? "#2563eb" : "#1e293b" }}>
                    {user.username}
                  </div>
                  <div style={styles.lastMsg}>{user.lastMessage || "Start a conversation"}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    width: "100%",
    maxWidth: "350px",
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "32px",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
  },
  header: {
    padding: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
  title: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#111827",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  badge: {
    background: "#2563eb",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "12px",
    scrollbarWidth: "none",
  },
  empty: {
    padding: "20px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "500",
  },
  userItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 16px",
    borderRadius: "20px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    marginBottom: "4px",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    objectFit: "cover",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  avatarFallback: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
  },
  onlineStatus: {
    position: "absolute",
    bottom: "-2px",
    right: "-2px",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "#10b981",
    border: "3px solid #fff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  userName: {
    fontSize: "15px",
    fontWeight: "700",
    marginBottom: "2px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  lastMsg: {
    fontSize: "12px",
    color: "#64748b",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: "500",
  },
};

export default ChatList;