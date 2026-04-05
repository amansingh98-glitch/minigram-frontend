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
import { createPost, getAllPosts } from "../services/postService";
import { getMyProfile } from "../services/userService";
import { resolveMediaUrl } from "../utils/media";

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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentUserName =
    currentProfile?.username ||
    localStorage.getItem("username") ||
    localStorage.getItem("userName") ||
    localStorage.getItem("name") ||
    "User";

  const currentUserImage = resolveMediaUrl(
    currentProfile?.profileImageUrl ||
      localStorage.getItem("profileImageUrl") ||
      ""
  );

  const currentUserInitial = currentUserName
    ? currentUserName.charAt(0).toUpperCase()
    : "U";

  const loadPosts = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getAllPosts();
      const normalizedPosts = Array.isArray(data)
        ? data.map((post) => ({
            ...post,
            imageUrl: resolveMediaUrl(post.imageUrl),
            videoUrl: resolveMediaUrl(post.videoUrl),
            profileImageUrl: resolveMediaUrl(post.profileImageUrl),
          }))
        : [];

      setPosts(normalizedPosts);
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

      const normalizedProfile = data
        ? {
            ...data,
            profileImageUrl: resolveMediaUrl(data.profileImageUrl),
            posts: Array.isArray(data.posts)
              ? data.posts.map((post) => ({
                  ...post,
                  imageUrl: resolveMediaUrl(post.imageUrl),
                  videoUrl: resolveMediaUrl(post.videoUrl),
                }))
              : [],
          }
        : null;

      setCurrentProfile(normalizedProfile);

      if (normalizedProfile?.username) {
        localStorage.setItem("username", normalizedProfile.username);
      }

      if (normalizedProfile?.profileImageUrl) {
        localStorage.setItem("profileImageUrl", normalizedProfile.profileImageUrl);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  useEffect(() => {
    loadPosts();
    loadMyProfile();
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
    setSelectedChatUser(
      user
        ? {
            ...user,
            profileImageUrl: resolveMediaUrl(user.profileImageUrl),
          }
        : null
    );
    setActivePage("messages");
  };

  const handleNavigate = (pageKey) => {
    // explore abhi real page nahi hai, isliye home par hi rakho
    if (pageKey === "explore") {
      setActivePage("home");
      return;
    }

    setActivePage(pageKey);

    if (pageKey === "profile") {
      setSelectedProfileUserId(null);
    }
  };

  const renderPage = () => {
    if (activePage === "messages") {
      return <ChatPage initialSelectedUser={selectedChatUser} />;
    }

    if (activePage === "profile") {
      return (
        <ProfilePage
          userId={selectedProfileUserId}
          onMessageUser={handleOpenChat}
        />
      );
    }

    if (activePage === "search") {
      return (
        <SearchPage
          onUserClick={handleOpenUserProfile}
          onMessageUser={handleOpenChat}
        />
      );
    }

    if (activePage === "settings") {
      return <SettingsPage onLogout={onLogout} />;
    }

    return (
      <div style={styles.contentWrapper(isMobile)}>
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
            onCommentAdded={loadPosts}
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
    );
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

      <div style={styles.mainArea(isMobile)}>
        <div style={styles.topbar(isMobile)}>
          <div style={styles.brandSection}>
            <div style={styles.brandAvatar}></div>
            <div>
              <h1 style={styles.logo}>MiniGram</h1>
              {!isMobile && <p style={styles.logoSub}>Connect and share</p>}
            </div>
          </div>

          <div style={styles.topIcons}>
            <div style={styles.currentUserBox}>
              {currentUserImage ? (
                <img
                  src={currentUserImage}
                  alt="User"
                  style={styles.userNavbarImage}
                />
              ) : (
                <div style={styles.userProfileAvatar}>{currentUserInitial}</div>
              )}
              {!isMobile && (
                <span style={styles.userBadge}>{currentUserName}</span>
              )}
            </div>

            <span
              style={styles.topIcon}
              onClick={() => setActivePage("messages")}
              title="Messages"
            >
              ✉️
            </span>

            <span
              style={styles.topIcon}
              title="Notifications"
            >
              🔔
            </span>

            <span
              style={styles.topIcon}
              onClick={handleOpenMyProfile}
              title="Profile"
            >
              👤
            </span>

            <span
              style={styles.topIcon}
              onClick={() => setActivePage("settings")}
              title="Settings"
            >
              ☰
            </span>
          </div>
        </div>

        <div style={styles.pageBody(isMobile)}>{renderPage()}</div>
      </div>

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

  mainArea: (isMobile) => ({
    marginLeft: isMobile ? "0px" : "78px",
    minHeight: "100vh",
    paddingBottom: isMobile ? "76px" : "0px",
  }),

  topbar: (isMobile) => ({
    position: "fixed",
    top: 0,
    left: isMobile ? "0px" : "78px",
    right: 0,
    height: isMobile ? "72px" : "80px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: isMobile ? "0 12px" : "0 28px",
    zIndex: 999,
  }),

  pageBody: (isMobile) => ({
    paddingTop: isMobile ? "84px" : "105px",
    paddingLeft: isMobile ? "10px" : "24px",
    paddingRight: isMobile ? "10px" : "24px",
    paddingBottom: isMobile ? "10px" : "24px",
  }),

  brandSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
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
    fontSize: "22px",
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
    gap: "12px",
    fontSize: "22px",
    color: "#6b7280",
  },

  topIcon: {
    cursor: "pointer",
    userSelect: "none",
  },

  currentUserBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#f3f4f6",
    padding: "6px 10px",
    borderRadius: "14px",
    maxWidth: "220px",
  },

  userProfileAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
    flexShrink: 0,
  },

  userNavbarImage: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #d1d5db",
    flexShrink: 0,
  },

  userBadge: {
    fontWeight: "600",
    color: "#374151",
    fontSize: "14px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  contentWrapper: (isMobile) => ({
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: "24px",
    alignItems: "flex-start",
  }),

  leftContent: {
    flex: 1,
    minWidth: 0,
  },

  rightContent: {
    width: "340px",
  },
};

export default HomePage;