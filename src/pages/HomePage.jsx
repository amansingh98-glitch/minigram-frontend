import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import MobileBottomNav from "../components/MobileBottomNav";
import StoriesBar from "../components/StoriesBar";
import PostComposer from "../components/PostComposer";
import Feed from "../components/Feed";
import RightPanel from "../components/RightPanel";
import ProfilePage from "./ProfilePage";
import ChatPage from "./ChatPage";
import SearchPage from "./SearchPage";
import SettingsPage from "./SettingsPage";
import ReelsPage from "./ReelsPage";
import { createPost, getAllPosts } from "../services/postService";
import { getMyProfile } from "../services/userService";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationsAsRead,
} from "../services/notificationService";
import { setOnline, setOffline, connectGlobalSocket, disconnectGlobalSocket } from "../services/chatService";
import { resolveMediaUrl } from "../utils/media";
import MobileSuggestions from "../components/MobileSuggestions";

const HomePage = ({ onLogout }) => {
  const [activePage, setActivePage] = useState("home");
  const [selectedProfileUserId, setSelectedProfileUserId] = useState(null);
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const handleDocClick = () => setShowNotifications(false);
    window.addEventListener("resize", handleResize);
    document.addEventListener("click", handleDocClick);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("click", handleDocClick);
    };
  }, []);

  const currentUserName = currentProfile?.username || localStorage.getItem("username") || "User";
  const currentUserImage = resolveMediaUrl(currentProfile?.profileImageUrl || localStorage.getItem("profileImageUrl") || "");
  const currentUserInitial = currentUserName.charAt(0).toUpperCase();

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getAllPosts();
      setPosts(Array.isArray(data) ? data.map(p => ({
        ...p,
        imageUrl: resolveMediaUrl(p.imageUrl),
        videoUrl: resolveMediaUrl(p.videoUrl),
        profileImageUrl: resolveMediaUrl(p.profileImageUrl),
      })) : []);
    } catch (error) {
      console.error(error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyProfile = async () => {
    try {
      const data = await getMyProfile();
      if (data) {
        setCurrentProfile({
          ...data,
          profileImageUrl: resolveMediaUrl(data.profileImageUrl),
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(typeof count === "number" ? count : 0);
    } catch (error) {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadPosts();
    loadMyProfile();
    loadUnreadCount();
    setOnline().catch(console.error);
    return () => {
      setOffline().catch(console.error);
      disconnectGlobalSocket();
    };
  }, []);

  useEffect(() => {
    if (currentProfile?.id) {
      connectGlobalSocket(currentProfile.id, (payload) => {
        if (activePage === "messages" && selectedChatUser?.userId === payload.senderId) return;
        if (payload.senderId !== currentProfile.id) {
           setToastMessage({
             senderName: payload.senderName || "Someone",
             text: payload.messageType === "FILE" || payload.messageType === "IMAGE" ? "Sent an attachment" : payload.messageText,
             senderId: payload.senderId
           });
           setTimeout(() => setToastMessage(null), 5000);
        }
      });
    }
  }, [currentProfile, activePage, selectedChatUser]);

  const handleCreatePost = async () => {
    if (!content.trim() && !selectedImage) return;
    try {
      await createPost(content, selectedImage);
      setContent("");
      setSelectedImage(null);
      await loadPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenMyProfile = () => { setActivePage("profile"); setSelectedProfileUserId(null); };
  const handleOpenUserProfile = (userId) => { setActivePage("profile"); setSelectedProfileUserId(userId); };
  const handleOpenChat = (user) => {
    setSelectedChatUser(user ? { ...user, profileImageUrl: resolveMediaUrl(user.profileImageUrl) } : null);
    setActivePage("messages");
  };

  const handleNavigate = (page) => {
    setActivePage(page === "explore" ? "home" : page);
    if (page === "profile") setSelectedProfileUserId(null);
  };

  const renderPage = () => {
    switch (activePage) {
      case "messages": return <ChatPage initialSelectedUser={selectedChatUser} />;
      case "profile": return <ProfilePage userId={selectedProfileUserId} onMessageUser={handleOpenChat} />;
      case "search": return <SearchPage onUserClick={handleOpenUserProfile} onMessageUser={handleOpenChat} />;
      case "settings": return <SettingsPage onLogout={onLogout} onOpenProfile={handleOpenMyProfile} />;
      case "reels": return <ReelsPage posts={posts} onUpdate={loadPosts} />;
      default:
        return (
          <div style={styles.mainFeedGrid(isMobile)}>
            <div style={styles.leftCol}>
              <StoriesBar />
              <PostComposer
                content={content}
                setContent={setContent}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                onCreatePost={handleCreatePost}
              />
              {isMobile && <MobileSuggestions onUserClick={handleOpenUserProfile} />}
              <Feed
                posts={posts}
                loading={loading}
                onCommentAdded={loadPosts}
                onUserClick={handleOpenUserProfile}
                onMessageUser={handleOpenChat}
              />
            </div>
            {!isMobile && (
              <div style={styles.rightCol}>
                <RightPanel onUserClick={handleOpenUserProfile} onMessageUser={handleOpenChat} />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div style={styles.appContainer}>
      <style>{globalAnimations}</style>
      
      {!isMobile && (
        <Sidebar onLogout={onLogout} activePage={activePage} onNavigate={handleNavigate} />
      )}

      <div style={styles.contentArea(isMobile)}>
        <nav style={styles.topNavbar(isMobile)}>
          <div style={styles.logoBox}>
            <div style={styles.logoCircle}>M</div>
            <h1 style={styles.logoText}>MiniGram</h1>
          </div>

          <div style={styles.navIcons}>
            <div style={styles.userCapsule} onClick={handleOpenMyProfile} title="My Profile">
               {currentUserImage ? (
                 <img src={currentUserImage} style={styles.navAvatar} alt="me" />
               ) : (
                 <div style={styles.navInitial}>{currentUserInitial}</div>
               )}
               {!isMobile && <span style={styles.navUsername}>{currentUserName}</span>}
            </div>

            <div style={styles.iconBtn} onClick={() => handleNavigate("messages")}>✉️</div>
            
            <div style={styles.relative} onClick={e => e.stopPropagation()}>
               <div style={styles.iconBtn} onClick={() => setShowNotifications(!showNotifications)}>🔔</div>
               {unreadCount > 0 && <div style={styles.redBadge}>{unreadCount}</div>}
               {showNotifications && (
                 <div style={styles.notifDropdown}>
                    <div style={styles.notifHeader}>Recent Notifications</div>
                    {notifications.length === 0 ? (
                      <p style={styles.emptyNotif}>All caught up! ✨</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={styles.notifItem}>
                           {n.messageText || "New interaction"}
                        </div>
                      ))
                    )}
                 </div>
               )}
            </div>
            <div style={styles.iconBtn} onClick={() => handleNavigate("settings")}>☰</div>
          </div>
        </nav>

        <main style={styles.mainPad(isMobile)}>
          {renderPage()}
        </main>
      </div>

      {isMobile && <MobileBottomNav activePage={activePage} onNavigate={handleNavigate} />}

      {toastMessage && (
        <div style={styles.toast} onClick={() => handleOpenChat({ userId: toastMessage.senderId, username: toastMessage.senderName })}>
           <div style={styles.toastBar} />
           <div style={styles.toastContent}>
              <div style={styles.toastHeader}>
                 <strong>{toastMessage.senderName}</strong>
                 <span>Just now</span>
              </div>
              <p style={styles.toastText}>{toastMessage.text}</p>
           </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  appContainer: {
    minHeight: "100vh",
    backgroundColor: "#fcfdfe",
    color: "#111827",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  contentArea: (isMobile) => ({
    marginLeft: isMobile ? 0 : "80px",
    width: isMobile ? "100%" : "calc(100% - 80px)",
    transition: "margin 0.3s ease",
  }),
  topNavbar: (isMobile) => ({
    position: "fixed",
    top: 0,
    right: 0,
    left: isMobile ? 0 : "80px",
    height: "72px",
    backgroundColor: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    borderBottom: "1px solid var(--glass-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: isMobile ? "0 16px" : "0 32px",
    zIndex: 2000,
    boxShadow: "0 4px 10px rgba(0,0,0,0.02)",
  }),
  logoBox: { display: "flex", alignItems: "center", gap: "10px" },
  logoCircle: {
     width: "36px", height: "36px", borderRadius: "10px", 
     background: "linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))",
     color: "#fff", display: "flex", alignItems: "center", 
     justifyContent: "center", fontWeight: "900", fontSize: "18px",
     boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)"
  },
  logoText: { 
    fontSize: "22px", 
    fontWeight: "900", 
    color: "var(--text-main)", 
    margin: 0, 
    letterSpacing: "-1px",
    fontFamily: "'Outfit', sans-serif"
  },
  navIcons: { display: "flex", alignItems: "center", gap: "14px" },
  userCapsule: {
    display: "flex", alignItems: "center", gap: "8px", 
    backgroundColor: "rgba(37, 99, 235, 0.05)", 
    padding: "6px 14px", borderRadius: "100px", border: "1px solid rgba(37, 99, 235, 0.1)",
    cursor: "pointer", transition: "all 0.2s ease"
  },
  navAvatar: { width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" },
  navInitial: { 
    width: "30px", height: "30px", borderRadius: "50%", background: "var(--primary-accent)", 
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800" 
  },
  navUsername: { fontSize: "14px", fontWeight: "700", color: "var(--text-main)" },
  iconBtn: { fontSize: "20px", cursor: "pointer", transition: "transform 0.2s ease", color: "var(--text-main)" },
  redBadge: {
    position: "absolute", top: "-4px", right: "-4px", backgroundColor: "#ef4444", 
    color: "#fff", fontSize: "10px", fontWeight: "800", padding: "2px 5px", borderRadius: "100px", border: "2px solid #fff"
  },
  relative: { position: "relative" },
  notifDropdown: {
    position: "absolute", top: "50px", right: 0, width: "300px", 
    backgroundColor: "var(--glass-bg)", backdropFilter: "var(--glass-blur)", 
    borderRadius: "24px", boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
    border: "1px solid var(--glass-border)", padding: "12px", overflow: "hidden",
    zIndex: 3000
  },
  notifItem: { padding: "10px", borderBottom: "1px solid #f9fafb", fontSize: "13px" },
  mainPad: (isMobile) => ({
    paddingTop: "90px",
    paddingLeft: isMobile ? "12px" : "40px",
    paddingRight: isMobile ? "12px" : "40px",
    paddingBottom: isMobile ? "80px" : "40px",
  }),
  mainFeedGrid: (isMobile) => ({
    display: "flex",
    gap: "32px",
    maxWidth: "1200px",
    margin: "0 auto",
  }),
  leftCol: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "24px" },
  rightCol: { width: "320px", position: "sticky", top: "105px", height: "fit-content" },
  toast: {
    position: "fixed", top: "85px", left: "50%", transform: "translateX(-50%)",
    backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    display: "flex", width: "320px", overflow: "hidden", zIndex: 10001, cursor: "pointer",
    animation: "slideInTop 0.5s ease forwards"
  },
  toastBar: { width: "6px", backgroundColor: "#2563eb" },
  toastContent: { padding: "12px 16px", flex: 1 },
  toastHeader: { display: "flex", justifyContent: "space-between", marginBottom: "4px" },
  toastText: { fontSize: "13px", color: "#6b7280", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
};

const globalAnimations = `
@keyframes slideInTop {
  from { transform: translate(-50%, -100%); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}
.settings-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(37, 99, 235, 0.1); }
`;

export default HomePage;