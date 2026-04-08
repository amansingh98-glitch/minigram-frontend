import React from "react";

const MobileBottomNav = ({ activePage, onNavigate }) => {
  const menuItems = [
    { icon: "🏠", label: "Home", key: "home" },
    { icon: "🔍", label: "Search", key: "search" },
    { icon: "🎬", label: "Reels", key: "reels" },
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
            style={{
              ...styles.item,
              color: isActive ? "#2563eb" : "#94a3b8",
            }}
            onClick={() => onNavigate(item.key)}
          >
            <div style={{ 
              ...styles.iconWrapper, 
              backgroundColor: isActive ? "rgba(37, 99, 235, 0.1)" : "transparent",
              transform: isActive ? "translateY(-4px)" : "translateY(0)"
            }}>
              <span style={{ 
                ...styles.icon, 
                fontSize: isActive ? "22px" : "20px",
                filter: isActive ? "none" : "grayscale(100%) opacity(0.7)"
              }}>
                {item.icon}
              </span>
            </div>
            {isActive && <span style={styles.label}>{item.label}</span>}
          </div>
        );
      })}
    </nav>
  );
};

const styles = {
  nav: {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 40px)",
    maxWidth: "400px",
    height: "72px",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
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
    gap: "2px",
    cursor: "pointer",
    flex: 1,
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    height: "100%",
  },
  iconWrapper: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  icon: { transition: "all 0.3s ease" },
  label: { 
    fontSize: "10px", 
    fontWeight: "800", 
    textTransform: "uppercase", 
    letterSpacing: "0.5px",
    animation: "fadeIn 0.3s ease forwards"
  },
};

export default MobileBottomNav;