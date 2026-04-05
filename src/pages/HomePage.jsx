import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StoriesBar from "../components/StoriesBar";
import PostComposer from "../components/PostComposer";
import Feed from "../components/Feed";
import RightPanel from "../components/RightPanel";
import ProfilePage from "./ProfilePage";
import ChatPage from "./ChatPage";
import SearchPage from "./SearchPage";
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
    setActivePage(pageKey);

    if (pageKey === "profile") {
      setSelectedProfileUserId(null);
    }
  };

  return (
    <div style={styles.page}>
      <Sidebar
        onLogout={onLogout}
        activePage={activePage}
        onNavigate={handleNavigate}
      />

      <div style={styles.mainArea}>
        <div style={styles.topbar}>
          <div style={styles.brandSection}>
            <div style={styles.brandAvatar}></div>
            <div>
              <h1 style={styles.logo}>MiniGram</h1>
              <p style={styles.logoSub}>Connect and share</p>
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
              <span style={styles.userBadge}>{currentUserName}</span>
            </div>

            <span
              style={styles.topIcon}
              onClick={() => setActivePage("messages")}
              title="Messages"
            >
              ✉️
            </span>

            <span style={styles.topIcon} title="Notifications">
              🔔
            </span>

            <span
              style={styles.topIcon}
              onClick={handleOpenMyProfile}
              title="Profile"
            >
              👤
            </span>

            <span style={styles.topIcon} title="Menu">
              ☰
            </span>
          </div>
        </div>

        {activePage === "messages" ? (
          <div style={styles.fullPageWrapper}>
            <ChatPage initialSelectedUser={selectedChatUser} />
          </div>
        ) : activePage === "profile" ? (
          <div style={styles.fullPageWrapper}>
            <ProfilePage
              userId={selectedProfileUserId}
              onMessageUser={handleOpenChat}
            />
          </div>
        ) : activePage === "search" ? (
          <div style={styles.fullPageWrapper}>
            <SearchPage
              onUserClick={handleOpenUserProfile}
              onMessageUser={handleOpenChat}
            />
          </div>
        ) : (
          <div style={styles.contentWrapper}>
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

            <div style={styles.rightContent}>
              <RightPanel
                onUserClick={handleOpenUserProfile}
                onMessageUser={handleOpenChat}
              />
            </div>
          </div>
        )}
      </div>
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
    marginLeft: "78px",
    minHeight: "100vh",
  },
  topbar: {
    position: "fixed",
    top: 0,
    left: "78px",
    right: 0,
    height: "80px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    zIndex: 999,
  },
  brandSection: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  brandAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    backgroundColor: "#e5e7eb",
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
    gap: "18px",
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
    padding: "8px 12px",
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
  contentWrapper: {
    display: "flex",
    gap: "24px",
    padding: "105px 24px 24px 24px",
    alignItems: "flex-start",
  },
  fullPageWrapper: {
    padding: "105px 24px 24px 24px",
  },
  leftContent: {
    flex: 1,
    minWidth: 0,
  },
  rightContent: {
    width: "340px",
  },
};

export default HomePage;