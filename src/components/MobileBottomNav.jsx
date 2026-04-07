import React from "react";

const MobileBottomNav = ({ activePage, onNavigate }) => {
  const menuItems = [
    { icon: "🏠", label: "Home", key: "home" },
    { icon: "🔍", label: "Search", key: "search" },
    { icon: "🎬", label: "Reels", key: "reels" },
    { icon: "💬", label: "Chat", key: "messages" },
    { icon: "👤", label: "Profile", key: "profile" },
    { icon: "⚙️", label: "Settings", key: "settings" },
  ];

  return (
    <nav style={styles.nav}>
      {menuItems.map((item) => (
        <div
          key={item.key}
          style={{
            ...styles.item,
            color: activePage === item.key ? "#2563eb" : "#9ca3af",
            transform: activePage === item.key ? "translateY(-4px)" : "translateY(0)"
          }}
          onClick={() => onNavigate(item.key)}
        >
          <div style={{ ...styles.icon, transform: activePage === item.key ? "scale(1.2)" : "scale(1)" }}>
            {item.icon}
          </div>
          <span style={{ ...styles.label, opacity: activePage === item.key ? 1 : 0.8 }}>
            {item.label}
          </span>
          {activePage === item.key && <div style={styles.activeDot} />}
        </div>
      ))}
    </nav>
  );
};

const styles = {
  nav: {
    position: "fixed",
    bottom: "12px",
    left: "12px",
    right: "12px",
    height: "68px",
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: "24px",
    border: "1px solid rgba(229, 231, 235, 0.5)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 9999,
    padding: "0 10px",
  },
  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    cursor: "pointer",
    flex: 1,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative"
  },
  icon: { fontSize: "20px", transition: "transform 0.3s ease" },
  label: { fontSize: "10px", fontWeight: "700", transition: "opacity 0.3s ease" },
  activeDot: {
    position: "absolute", bottom: "-8px", width: "4px", height: "4px", 
    borderRadius: "50%", background: "#2563eb"
  }
};

export default MobileBottomNav;