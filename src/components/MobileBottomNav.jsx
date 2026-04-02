import React from "react";

const MobileBottomNav = ({ activePage, onNavigate }) => {
  return (
    <div style={styles.nav}>
      <span
        style={activePage === "home" ? styles.active : styles.icon}
        onClick={() => onNavigate("home")}
      >
        🏠
      </span>

      <span
        style={activePage === "messages" ? styles.active : styles.icon}
        onClick={() => onNavigate("messages")}
      >
        💬
      </span>

      <span
        style={activePage === "profile" ? styles.active : styles.icon}
        onClick={() => onNavigate("profile")}
      >
        👤
      </span>

      <span
        style={activePage === "settings" ? styles.active : styles.icon}
        onClick={() => onNavigate("settings")}
      >
        ⚙️
      </span>
    </div>
  );
};

const styles = {
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60px",
    background: "#fff",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 999,
  },

  icon: {
    fontSize: "22px",
    color: "#6b7280",
    cursor: "pointer",
  },

  active: {
    fontSize: "24px",
    color: "#2563eb",
    cursor: "pointer",
  },
};

export default MobileBottomNav;