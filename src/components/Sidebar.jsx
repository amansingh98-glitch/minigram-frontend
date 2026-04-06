import React, { useState } from "react";

const Sidebar = ({ onLogout, activePage = "home", onNavigate }) => {
  const [expanded, setExpanded] = useState(false);

  const menuItems = [
    { icon: "🏠", label: "Home", key: "home" },
    { icon: "🔍", label: "Search", key: "search" },
    { icon: "🧭", label: "Explore", key: "explore" },
    { icon: "🎬", label: "Reels", key: "reels" },
    { icon: "💬", label: "Messages", key: "messages" },
    { icon: "🔔", label: "Notifications", key: "notifications" },
    { icon: "👤", label: "Profile", key: "profile" },
    { icon: "⚙️", label: "Settings", key: "settings" },
  ];

  return (
    <div
      style={{
        ...styles.sidebar,
        width: expanded ? "220px" : "78px",
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div style={styles.topSection}>
        {menuItems.map((item, index) => (
          <div
            key={index}
            style={{
              ...styles.menuItem,
              backgroundColor: activePage === item.key ? "#ffffff" : "transparent",
              boxShadow:
                activePage === item.key
                  ? "0 6px 18px rgba(0,0,0,0.08)"
                  : "none",
            }}
            onClick={() => onNavigate && onNavigate(item.key)}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span
              style={{
                ...styles.label,
                opacity: expanded ? 1 : 0,
                width: expanded ? "auto" : 0,
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div style={styles.bottomSection}>
        <div style={styles.menuItem} onClick={onLogout}>
          <span style={styles.icon}>⏻</span>
          <span
            style={{
              ...styles.label,
              opacity: expanded ? 1 : 0,
              width: expanded ? "auto" : 0,
              color: "#dc2626",
            }}
          >
            Logout
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    backgroundColor: "#f5f7fb",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "16px 12px",
    transition: "width 0.3s ease",
    overflow: "hidden",
    zIndex: 1000,
  },

  topSection: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  bottomSection: {
    marginBottom: "10px",
  },

  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    borderRadius: "18px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    color: "#374151",
    transition: "all 0.3s ease",
  },

  icon: {
    fontSize: "22px",
    minWidth: "24px",
    textAlign: "center",
  },

  label: {
    fontSize: "16px",
    fontWeight: "500",
    overflow: "hidden",
    transition: "all 0.3s ease",
  },
};

export default Sidebar;