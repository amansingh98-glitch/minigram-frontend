import React, { useState } from "react";

const Sidebar = ({ onLogout, activePage = "home", onNavigate }) => {
  const [expanded, setExpanded] = useState(false);

  const menuItems = [
    { icon: "🏠", label: "Home", key: "home" },
    { icon: "🔍", label: "Search", key: "search" },
    { icon: "🧭", label: "Explore", key: "explore" },
    { icon: "🎬", label: "Reels", key: "reels" },
    { icon: "💬", label: "Messages", key: "messages" },
    { icon: "👤", label: "Profile", key: "profile" },
    { icon: "⚙️", label: "Settings", key: "settings" },
  ];

  return (
    <aside
      style={{
        ...styles.sidebar,
        width: expanded ? "240px" : "80px",
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div style={styles.topSection}>
        <div style={styles.logoItem}>
           <div style={styles.logoCircle}>M</div>
           {expanded && <span style={styles.logoText}>MiniGram</span>}
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <div
              key={item.key}
              style={{
                ...styles.menuItem,
                background: activePage === item.key ? "rgba(37, 99, 235, 0.08)" : "transparent",
                color: activePage === item.key ? "#2563eb" : "#4b5563",
              }}
              onClick={() => onNavigate && onNavigate(item.key)}
            >
              <span style={{ ...styles.icon, transform: activePage === item.key ? "scale(1.2)" : "scale(1)" }}>
                {item.icon}
              </span>
              {expanded && <span style={styles.label}>{item.label}</span>}
              {activePage === item.key && !expanded && <div style={styles.activeIndicator} />}
            </div>
          ))}
        </nav>
      </div>

      <div style={styles.bottomSection}>
        <div style={styles.logoutItem} onClick={onLogout}>
          <span style={styles.icon}>🚪</span>
          {expanded && <span style={styles.label}>Logout</span>}
        </div>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRight: "1px solid rgba(229, 231, 235, 0.5)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "24px 12px",
    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 2000,
  },
  topSection: { display: "flex", flexDirection: "column", gap: "32px" },
  logoItem: { display: "flex", alignItems: "center", gap: "12px", padding: "0 12px", height: "40px" },
  logoCircle: {
     width: "32px", height: "32px", borderRadius: "10px", 
     background: "linear-gradient(135deg, #2563eb, #4f46e5)",
     color: "#fff", display: "flex", alignItems: "center", 
     justifyContent: "center", fontWeight: "900", fontSize: "16px"
  },
  logoText: { fontSize: "20px", fontWeight: "900", letterSpacing: "-1px", color: "#111827" },
  nav: { display: "flex", flexDirection: "column", gap: "8px" },
  menuItem: {
    display: "flex", alignItems: "center", gap: "16px", padding: "12px",
    borderRadius: "14px", cursor: "pointer", transition: "all 0.2s ease",
    position: "relative", overflow: "hidden"
  },
  icon: { fontSize: "22px", minWidth: "32px", textAlign: "center", transition: "transform 0.2s ease" },
  label: { fontSize: "15px", fontWeight: "700", whiteSpace: "nowrap" },
  activeIndicator: {
    position: "absolute", left: "-6px", top: "25%", bottom: "25%", 
    width: "4px", background: "#2563eb", borderRadius: "0 4px 4px 0"
  },
  bottomSection: { marginTop: "auto" },
  logoutItem: {
    display: "flex", alignItems: "center", gap: "16px", padding: "12px",
    borderRadius: "14px", cursor: "pointer", color: "#ef4444", 
    background: "rgba(239, 68, 68, 0.05)", transition: "all 0.2s ease"
  }
};

export default Sidebar;