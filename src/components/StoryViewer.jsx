import React, { useEffect, useState } from "react";

const StoryViewer = ({ stories = [], currentIndex = 0, onClose, onChangeIndex }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!stories.length) return;

    const currentStory = stories[currentIndex];
    if (!currentStory) return;

    if (currentStory.mediaType === "VIDEO") return;

    const timer = setTimeout(() => {
      if (currentIndex < stories.length - 1) {
        onChangeIndex(currentIndex + 1);
      } else {
        onClose();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [stories, currentIndex, onChangeIndex, onClose]);

  if (!stories.length) return null;

  const story = stories[currentIndex];
  if (!story) return null;

  const isVideo = story.mediaType === "VIDEO";

  const goPrev = () => {
    if (currentIndex > 0) {
      onChangeIndex(currentIndex - 1);
    }
  };

  const goNext = () => {
    if (currentIndex < stories.length - 1) {
      onChangeIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <div style={styles.overlay}>
      <div
        style={{
          ...styles.viewer,
          width: isMobile ? "100%" : "420px",
          height: isMobile ? "100%" : "85vh",
          borderRadius: isMobile ? "0" : "24px",
        }}
      >
        <div style={styles.topBar}>
          <div style={styles.progressWrap}>
            {stories.map((_, idx) => (
              <div key={idx} style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width:
                      idx < currentIndex
                        ? "100%"
                        : idx === currentIndex
                        ? "70%"
                        : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          <div style={styles.headerRow}>
            <div style={styles.userInfo}>
              {story.profileImageUrl ? (
                <img
                  src={story.profileImageUrl}
                  alt={story.username}
                  style={styles.avatar}
                />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  {story.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <span style={styles.username}>{story.username}</span>
            </div>

            <button style={styles.closeBtn} onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div style={styles.mediaArea}>
          {!isVideo ? (
            <img src={story.mediaUrl} alt="story" style={styles.media} />
          ) : (
            <video
              src={story.mediaUrl}
              controls
              autoPlay
              style={styles.media}
              onEnded={goNext}
            />
          )}
        </div>

        {/* Left Button */}
        <button
          style={{
            ...styles.navBtn,
            left: isMobile ? "8px" : "12px",
            opacity: currentIndex === 0 ? 0.45 : 1,
          }}
          onClick={goPrev}
          disabled={currentIndex === 0}
        >
          ‹
        </button>

        {/* Right Button */}
        <button
          style={{
            ...styles.navBtn,
            right: isMobile ? "8px" : "12px",
          }}
          onClick={goNext}
        >
          ›
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3000,
  },

  viewer: {
    position: "relative",
    background: "#111827",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: "12px",
  },

  progressWrap: {
    display: "flex",
    gap: "6px",
    marginBottom: "12px",
  },

  progressTrack: {
    flex: 1,
    height: "4px",
    background: "rgba(255,255,255,0.25)",
    borderRadius: "999px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#ffffff",
    transition: "width 0.3s ease",
  },

  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#ffffff",
  },

  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  avatarPlaceholder: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  username: {
    fontWeight: "700",
    fontSize: "14px",
  },

  closeBtn: {
    border: "none",
    background: "transparent",
    color: "#ffffff",
    fontSize: "24px",
    cursor: "pointer",
  },

  mediaArea: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  media: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    background: "#000000",
  },

  navBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "rgba(255,255,255,0.28)",
    color: "#ffffff",
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    fontSize: "28px",
    lineHeight: "42px",
    textAlign: "center",
    cursor: "pointer",
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default StoryViewer;