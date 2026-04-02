import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StoriesBar from "../components/StoriesBar";
import PostComposer from "../components/PostComposer";
import Feed from "../components/Feed";
import RightPanel from "../components/RightPanel";
import MobileBottomNav from "../components/MobileBottomNav";
import SearchPage from "./SearchPage";



import ProfilePage from "./ProfilePage";
import ChatPage from "./ChatPage";
import SettingsPage from "./SettingsPage";

import { createPost, getAllPosts } from "../services/postService";
import { getMyProfile } from "../services/userService";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationsAsRead,
} from "../services/notificationService";

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

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const [showForgotPasswordFromSettings, setShowForgotPasswordFromSettings] =
    useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const currentUserName =
    currentProfile?.username ||
    localStorage.getItem("username") ||
    localStorage.getItem("userName") ||
    localStorage.getItem("name") ||
    "User";

  const currentUserImage =
    currentProfile?.profileImageUrl ||
    localStorage.getItem("profileImageUrl") ||
    "";

  const currentUserInitial = currentUserName
    ? currentUserName.charAt(0).toUpperCase()
    : "U";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setMessage("");
      const data = await getAllPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading posts:", error);
      setPosts([]);
      setMessage("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const loadMyProfile = async () => {
    try {
      const data = await getMyProfile();
      setCurrentProfile(data);

      if (data?.username) {
        localStorage.setItem("username", data.username);
      }

      if (data?.profileImageUrl) {
        localStorage.setItem("profileImageUrl", data.profileImageUrl);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const [list, count] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount(),
      ]);

      setNotifications(Array.isArray(list) ? list : []);
      setUnreadCount(typeof count === "number" ? count : 0);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadPosts();
    loadMyProfile();
    loadNotifications();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCreatePost = async () => {
    if (!content.trim() && !selectedImage) {
      setMessage("Post content or media required");
      return;
    }

    try {
      const responseMessage = await createPost(content, selectedImage);
      setMessage(responseMessage || "Post created successfully");
      setContent("");
      setSelectedImage(null);
      await loadPosts();
      await loadMyProfile();
      await loadNotifications();
    } catch (error) {
      console.error("Error creating post:", error);
      setMessage("Failed to create post");
    }
  };

  const handleOpenMyProfile = () => {
    setSelectedProfileUserId(null);
    setActivePage("profile");
  };

  const handleOpenUserProfile = (userId) => {
    setSelectedProfileUserId(userId);
    setActivePage("profile");
  };

  const handleOpenChat = (user) => {
    setSelectedChatUser(user);
    setActivePage("messages");
  };

  const handleNavigate = (pageKey) => {
    setActivePage(pageKey);

    if (pageKey === "profile") {
      setSelectedProfileUserId(null);
    }
  };

  const handleNotificationClick = async () => {
    const next = !showNotifications;
    setShowNotifications(next);

    if (next) {
      try {
        await markNotificationsAsRead();
        await loadNotifications();
      } catch (error) {
        console.error("Notification mark read error:", error);
      }
    }
  };

  return (
    <div style={styles.page}>
      {!isMobile && (
        <Sidebar
          onLogout={onLogout}
          activePage={activePage}
          onNavigate={handleNavigate}
        />
      )}

      <div
        style={{
          ...styles.mainArea,
          marginLeft: isMobile ? 0 : "78px",
        }}
      >
        <div
          style={{
            ...styles.topbar,
            left: isMobile ? 0 : "78px",
            padding: isMobile ? "0 12px" : "0 28px",
            height: isMobile ? "72px" : "80px",
          }}
        >
          <div style={styles.brandSection}>
            <div style={styles.brandAvatar}></div>
            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  ...styles.logo,
                  fontSize: isMobile ? "16px" : "22px",
                }}
              >
                
                MiniGram
              </h1>
              {!isMobile && <p style={styles.logoSub}>Connect and share</p>}
            </div>
          </div>

          <div
            style={{
              ...styles.topIcons,
              gap: isMobile ? "10px" : "18px",
              fontSize: isMobile ? "18px" : "22px",
            }}
          >
            <div
              style={{
                ...styles.currentUserBox,
                padding: isMobile ? "6px 10px" : "8px 12px",
                maxWidth: isMobile ? "120px" : "unset",
              }}
            >
              {currentUserImage ? (
                <img
                  src={currentUserImage}
                  alt="User"
                  style={{
                    ...styles.userNavbarImage,
                    width: isMobile ? "28px" : "34px",
                    height: isMobile ? "28px" : "34px",
                  }}
                />
              ) : (
                <div
                  style={{
                    ...styles.userProfileAvatar,
                    width: isMobile ? "28px" : "34px",
                    height: isMobile ? "28px" : "34px",
                    fontSize: isMobile ? "12px" : "14px",
                  }}
                >
                  {currentUserInitial}
                </div>
              )}

              <span
                style={{
                  ...styles.userBadge,
                  fontSize: isMobile ? "13px" : "14px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: isMobile ? "55px" : "120px",
                }}
              >
                {currentUserName}
              </span>
            </div>

            <span
              style={styles.topIcon}
              onClick={() => setActivePage("messages")}
            >
              ✉️
            </span>

            <div style={styles.notificationWrap}>
              <span style={styles.topIcon} onClick={handleNotificationClick}>
                🔔
              </span>

              {unreadCount > 0 && (
                <div style={styles.notificationBadge}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </div>
              )}

              {showNotifications && (
                <div
                  style={{
                    ...styles.notificationPanel,
                    width: isMobile ? "280px" : "320px",
                    right: isMobile ? "-30px" : 0,
                  }}
                >
                  <div style={styles.notificationTitle}>Notifications</div>

                  {notifications.length === 0 ? (
                    <div style={styles.notificationEmpty}>
                      No notifications yet
                    </div>
                  ) : (
                    <div style={styles.notificationList}>
                      {notifications.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            ...styles.notificationItem,
                            ...(item.read ? {} : styles.notificationUnread),
                          }}
                        >
                          <div style={styles.notificationText}>
                            {item.messageText}
                          </div>
                          <div style={styles.notificationTime}>
                            {item.createdAt
                              ? item.createdAt.replace("T", " ").slice(0, 16)
                              : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <span style={styles.topIcon} onClick={handleOpenMyProfile}>
              👤
            </span>

            <span
              style={styles.topIcon}
              onClick={() => setActivePage("settings")}
            >
              ⚙️
            </span>
          </div>
        </div>

        {activePage === "messages" ? (
          <div
            style={{
              ...styles.fullPageWrapper,
              padding: isMobile
                ? "88px 10px 70px 10px"
                : "105px 24px 24px 24px",
            }}
          >
            <ChatPage initialSelectedUser={selectedChatUser} />
          </div>
        ) : activePage === "profile" ? (
          <div
            style={{
              ...styles.fullPageWrapper,
              padding: isMobile
                ? "88px 10px 70px 10px"
                : "105px 24px 24px 24px",
            }}
          >
            <ProfilePage
              userId={selectedProfileUserId}
              onMessageUser={handleOpenChat}
            />
          </div>
        ) : activePage === "settings" ? (
          <div
            style={{
              ...styles.fullPageWrapper,
              padding: isMobile
                ? "88px 10px 70px 10px"
                : "105px 24px 24px 24px",
            }}
          >
            <SettingsPage
              onOpenProfile={handleOpenMyProfile}
              onOpenForgotPassword={() =>
                setShowForgotPasswordFromSettings(true)
              }
              onLogout={onLogout}
            />
          </div>
          ) : activePage === "search" ? (
  <div
    style={{
      ...styles.fullPageWrapper,
      padding: isMobile
        ? "88px 10px 70px 10px"
        : "105px 24px 24px 24px",
    }}
  >
    <SearchPage
      onUserClick={handleOpenUserProfile}
      onMessageUser={handleOpenChat}
    />
  </div>
        ) : 
        (
          <div
            style={{
              ...styles.contentWrapper,
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "14px" : "24px",
              padding: isMobile
                ? "88px 10px 70px 10px"
                : "105px 24px 24px 24px",
            }}
          >
            <div style={styles.leftContent}>
              <StoriesBar />

              <PostComposer
                content={content}
                setContent={setContent}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                onCreatePost={handleCreatePost}
                message={message}
              />

              <Feed
                posts={posts}
                loading={loading}
                onCommentAdded={async () => {
                  await loadPosts();
                  await loadNotifications();
                }}
                onUserClick={handleOpenUserProfile}
                onMessageUser={handleOpenChat}
              />
            </div>

            {!isMobile && (
              <div style={styles.rightContent}>
                <RightPanel
                  onUserClick={handleOpenUserProfile}
                  onMessageUser={handleOpenChat}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {showForgotPasswordFromSettings && (
        <div style={forgotStyles.overlay}>
          <div style={forgotStyles.card}>
            <h3 style={forgotStyles.title}>Forgot Password</h3>
            <p style={forgotStyles.text}>
              For password reset using OTP, please logout and use the Forgot
              Password option on the login screen.
            </p>

            <div style={forgotStyles.actions}>
              <button
                style={forgotStyles.primaryBtn}
                onClick={() => {
                  setShowForgotPasswordFromSettings(false);
                  onLogout();
                }}
              >
                Logout & Continue
              </button>

              <button
                style={forgotStyles.secondaryBtn}
                onClick={() => setShowForgotPasswordFromSettings(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobile && (
        <MobileBottomNav
          activePage={activePage}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: "#f5f7fb",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },

  mainArea: {
    minHeight: "100vh",
    transition: "all 0.3s ease",
  },

  topbar: {
    position: "fixed",
    top: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 999,
  },

  brandSection: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },

  brandAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    backgroundColor: "#e5e7eb",
    flexShrink: 0,
  },

  logo: {
    margin: 0,
    fontWeight: "700",
    color: "#1f2937",
  },

  logoSub: {
    margin: "2px 0 0 0",
    fontSize: "13px",
    color: "#6b7280",
  },

  topIcons: {
    display: "flex",
    alignItems: "center",
    color: "#6b7280",
    flexShrink: 0,
  },

  topIcon: {
    cursor: "pointer",
  },

  currentUserBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#f3f4f6",
    borderRadius: "14px",
    minWidth: 0,
  },

  userProfileAvatar: {
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    flexShrink: 0,
  },

  userNavbarImage: {
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #d1d5db",
    flexShrink: 0,
  },

  userBadge: {
    fontWeight: "600",
    color: "#374151",
  },

  notificationWrap: {
    position: "relative",
  },

  notificationBadge: {
    position: "absolute",
    top: "-6px",
    right: "-8px",
    minWidth: "18px",
    height: "18px",
    borderRadius: "999px",
    background: "#dc2626",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 5px",
  },

  notificationPanel: {
    position: "absolute",
    top: "36px",
    maxHeight: "420px",
    overflowY: "auto",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    boxShadow: "0 16px 40px rgba(0,0,0,0.10)",
    padding: "14px",
    zIndex: 2000,
  },

  notificationTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "12px",
  },

  notificationEmpty: {
    color: "#6b7280",
    fontSize: "14px",
    padding: "12px 0",
  },

  notificationList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  notificationItem: {
    background: "#f8fafc",
    borderRadius: "14px",
    padding: "12px",
    border: "1px solid #e5e7eb",
  },

  notificationUnread: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
  },

  notificationText: {
    fontSize: "14px",
    color: "#1f2937",
    lineHeight: "1.4",
    wordBreak: "break-word",
  },

  notificationTime: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "6px",
  },

  contentWrapper: {
    display: "flex",
    alignItems: "flex-start",
  },

  fullPageWrapper: {},

  leftContent: {
    flex: 1,
    minWidth: 0,
    width: "100%",
  },

  rightContent: {
    width: "340px",
    flexShrink: 0,
  },
};

const forgotStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2500,
    padding: "16px",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "20px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
  },

  title: {
    margin: 0,
    fontSize: "22px",
    color: "#1f2937",
  },

  text: {
    margin: "10px 0 0 0",
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.5",
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "18px",
  },

  primaryBtn: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "12px 16px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
  },

  secondaryBtn: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    padding: "12px 16px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
  },
};

export default HomePage;