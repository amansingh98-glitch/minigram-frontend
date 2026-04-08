import React from "react";

const MobileBottomNav = ({ activePage, onNavigate }) => {
  const menuItems = [
    { icon: "🏠", label: "Home", key: "home" },
    { icon: "🔍", label: "Search", key: "search" },
    { icon: "🎬", label: "Reels", key: "reels" },
    { icon: "🔔", label: "Inbox", key: "notifications" },
    { icon: "💬", label: "Chat", key: "messages" },
    { icon: "👤", label: "Profile", key: "profile" },
  ];

  return (
    <nav style={styles.nav}>
      {menuItems.map((item) => {
        const isActive = activePage === item.key;
        return (
          <div
            key={item.key}
            style={styles.item}
            onClick={() => onNavigate(item.key)}
          >
            <div style={{ 
              ...styles.iconWrapper, 
              color: isActive ? "#2563eb" : "#4b5563"
            }}>
              <span style={{ 
                ...styles.icon, 
                fontSize: "24px",
                transform: isActive ? "scale(1.1) translateY(-2px)" : "none",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              }}>
                {item.icon}
              </span>
              {isActive && <div style={styles.activeDot} />}
            </div>
            <span style={{ 
              ...styles.label, 
              color: isActive ? "#2563eb" : "#6b7280",
              opacity: isActive ? 1 : 0.8
            }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
};

const styles = {
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "72px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderTop: "1px solid rgba(0, 0, 0, 0.05)",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 9998,
    paddingBottom: "env(safe-area-inset-bottom)",
    boxShadow: "0 -4px 10px rgba(0,0,0,0.02)"
  },
  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    cursor: "pointer",
    flex: 1,
    height: "100%",
    position: "relative"
  },
  iconWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative"
  },
  icon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  activeDot: {
    width: "4px",
    height: "4px",
    backgroundColor: "#2563eb",
    borderRadius: "50%",
    marginTop: "2px",
    position: "absolute",
    bottom: "-8px"
  },
  label: { 
    fontSize: "10px", 
    fontWeight: "700", 
    transition: "all 0.2s ease"
  },
};

export default MobileBottomNav;