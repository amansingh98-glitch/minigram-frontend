import React from "react";
import { markNotificationsAsRead } from "../services/notificationService";

const NotificationsPage = ({ notifications, onUpdate, onUserClick, onPostClick }) => {
  const handleMarkAllRead = async () => {
    try {
      await markNotificationsAsRead();
      onUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const getTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "LIKE": return "❤️";
      case "COMMENT": return "💬";
      case "FOLLOW": return "👤";
      default: return "🔔";
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Notifications</h2>
        <button style={styles.markReadBtn} onClick={handleMarkAllRead}>
          Mark all as read
        </button>
      </header>

      <div style={styles.list}>
        {notifications.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>✨</div>
            <p>No notifications yet. Interactions will appear here!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              style={{
                ...styles.item,
                backgroundColor: n.read ? "transparent" : "rgba(37, 99, 235, 0.03)"
              }}
              onClick={() => {
                if (n.type === "FOLLOW") {
                  onUserClick(n.actorUserId);
                } else if (n.referenceId) {
                  onPostClick(n.referenceId);
                }
              }}
            >
              <div style={styles.actorAvatar}>
                {n.actorProfileImageUrl ? (
                  <img src={n.actorProfileImageUrl} alt="actor" style={styles.avatarImg} />
                ) : (
                  <div style={styles.avatarInitial}>{n.actorName?.charAt(0)}</div>
                )}
                <div style={styles.typeBadge}>{getNotifIcon(n.type)}</div>
              </div>

              <div style={styles.content}>
                <p style={styles.text}>
                  <span style={styles.actorName}>{n.actorName}</span> {n.messageText}
                </p>
                <span style={styles.time}>{getTimeAgo(n.createdAt)}</span>
              </div>

              {!n.read && <div style={styles.unreadDot} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(20px)",
    borderRadius: "32px",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    padding: "32px",
    minHeight: "70vh",
    boxShadow: "0 10px 40px rgba(0,0,0,0.02)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px"
  },
  title: {
    fontSize: "24px",
    fontWeight: "900",
    color: "#111827",
    margin: 0,
    letterSpacing: "-0.5px"
  },
  markReadBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: "12px",
    transition: "all 0.2s ease",
    ":hover": { backgroundColor: "rgba(37, 99, 235, 0.05)" }
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    borderRadius: "20px",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    border: "1px solid transparent",
    ":hover": { backgroundColor: "#fff", transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(0,0,0,0.05)", borderColor: "rgba(37, 99, 235, 0.1)" }
  },
  actorAvatar: {
    position: "relative",
    width: "50px",
    height: "50px"
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: "16px",
    objectFit: "cover"
  },
  avatarInitial: {
    width: "100%",
    height: "100%",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    color: "#4b5563"
  },
  typeBadge: {
    position: "absolute",
    bottom: "-4px",
    right: "-4px",
    width: "22px",
    height: "22px",
    backgroundColor: "#fff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    border: "2px solid #fff"
  },
  content: {
    flex: 1
  },
  text: {
    fontSize: "15px",
    color: "#374151",
    margin: "0 0 4px",
    lineHeight: "1.4"
  },
  actorName: {
    fontWeight: "800",
    color: "#111827"
  },
  time: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "600"
  },
  unreadDot: {
    width: "10px",
    height: "10px",
    backgroundColor: "#2563eb",
    borderRadius: "50%",
    boxShadow: "0 0 10px rgba(37, 99, 235, 0.3)"
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#64748b"
  },
  emptyIcon: {
    fontSize: "50px",
    marginBottom: "16px"
  }
};

export default NotificationsPage;
