import React from "react";

const MobileBottomNav = ({ activePage, onNavigate }) => {
  const itemStyle = (key) => ({
    ...styles.item,
    color: activePage === key ? "#2563eb" : "#6b7280",
    fontWeight: activePage === key ? "700" : "500",
  });

  return (
    <div style={styles.nav}>
      <div style={itemStyle("home")} onClick={() => onNavigate("home")}>
        <div style={styles.icon}>🏠</div>
        <div style={styles.label}>Home</div>
      </div>

      <div style={itemStyle("search")} onClick={() => onNavigate("search")}>
        <div style={styles.icon}>🔍</div>
        <div style={styles.label}>Search</div>
      </div>

      <div style={itemStyle("reels")} onClick={() => onNavigate("reels")}>
        <div style={styles.icon}>🎬</div>
        <div style={styles.label}>Reels</div>
      </div>

      <div style={itemStyle("messages")} onClick={() => onNavigate("messages")}>
        <div style={styles.icon}>💬</div>
        <div style={styles.label}>Chat</div>
      </div>

      <div style={itemStyle("profile")} onClick={() => onNavigate("profile")}>
        <div style={styles.icon}>👤</div>
        <div style={styles.label}>Profile</div>
      </div>

      <div style={itemStyle("settings")} onClick={() => onNavigate("settings")}>
        <div style={styles.icon}>⚙️</div>
        <div style={styles.label}>Settings</div>
      </div>
    </div>
  );
};

const styles = {
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "66px",
    background: "#fff",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 9999,
    padding: "4px 6px",
  },

  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
    cursor: "pointer",
    minWidth: "52px",
  },

  icon: {
    fontSize: "18px",
    lineHeight: 1,
  },

  label: {
    fontSize: "10px",
  },
};

export default MobileBottomNav;