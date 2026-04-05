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
import { createPost, getAllPosts } from "../services/postService";
import { getMyProfile } from "../services/userService";
import { resolveMediaUrl } from "../utils/media";

const HomePage = ({ onLogout }) => {
  const [activePage, setActivePage] = useState("home");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadPosts = async () => {
    const data = await getAllPosts();
    setPosts(data || []);
    setLoading(false);
  };

  const loadProfile = async () => {
    const data = await getMyProfile();
    setCurrentProfile(data);
  };

  useEffect(() => {
    loadPosts();
    loadProfile();
  }, []);

  const handleCreatePost = async () => {
    await createPost(content, selectedImage);
    setContent("");
    setSelectedImage(null);
    loadPosts();
  };

  return (
    <div style={{ background: "#f5f7fb", minHeight: "100vh" }}>
      
      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <Sidebar
          onLogout={onLogout}
          activePage={activePage}
          onNavigate={setActivePage}
        />
      )}

      <div
        style={{
          marginLeft: isMobile ? "0" : "78px",
          paddingBottom: isMobile ? "70px" : "0",
        }}
      >
        {/* TOPBAR */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: isMobile ? 0 : "78px",
            right: 0,
            height: "70px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            borderBottom: "1px solid #eee",
            zIndex: 999,
          }}
        >
          <h2>MiniGram</h2>

          {currentProfile?.profileImageUrl && (
            <img
              src={resolveMediaUrl(currentProfile.profileImageUrl)}
              style={{ width: 36, height: 36, borderRadius: "50%" }}
            />
          )}
        </div>

        {/* MAIN */}
        <div
          style={{
            paddingTop: "80px",
            paddingLeft: isMobile ? "10px" : "24px",
            paddingRight: isMobile ? "10px" : "24px",
          }}
        >
          {activePage === "home" && (
            <div style={{ display: "flex", gap: "20px" }}>
              
              {/* LEFT */}
              <div style={{ flex: 1 }}>
                <StoriesBar />

                <PostComposer
                  content={content}
                  setContent={setContent}
                  selectedImage={selectedImage}
                  setSelectedImage={setSelectedImage}
                  onCreatePost={handleCreatePost}
                  message={message}
                />

                <Feed posts={posts} loading={loading} />
              </div>

              {/* RIGHT (ONLY DESKTOP) */}
              {!isMobile && (
                <div style={{ width: "320px" }}>
                  <RightPanel />
                </div>
              )}
            </div>
          )}

          {activePage === "search" && <SearchPage />}
          {activePage === "profile" && <ProfilePage />}
          {activePage === "messages" && <ChatPage />}
        </div>
      </div>

      {/* MOBILE NAV */}
      {isMobile && (
        <MobileBottomNav
          activePage={activePage}
          onNavigate={setActivePage}
        />
      )}
    </div>
  );
};

export default HomePage;