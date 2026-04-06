import React, { useEffect, useMemo, useState } from "react";
import { likeStory, unlikeStory, viewStory, getStoryInsights } from "../services/storyService";

const StoryViewer = ({
  stories = [],
  currentIndex = 0,
  onClose,
  onChangeIndex,
  currentUserEmail = "",
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showViewers, setShowViewers] = useState(false);
  const [storyInsights, setStoryInsights] = useState({ viewCount: 0, likeCount: 0, viewers: [], likers: [] });
  const [localHasLiked, setLocalHasLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);

  const story = stories[currentIndex];
  
  const isVideo = story?.mediaType === "VIDEO";
  const isOwner =
    !!currentUserEmail &&
    !!story?.userEmail &&
    currentUserEmail.toLowerCase() === story.userEmail.toLowerCase();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!stories.length || !story) return;
    if (isVideo) return;

    const timer = setTimeout(() => {
      if (currentIndex < stories.length - 1) onChangeIndex(currentIndex + 1);
      else onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [stories, currentIndex, onChangeIndex, onClose, isVideo, story]);

  useEffect(() => {
    setShowViewers(false);
  }, [currentIndex]);

  useEffect(() => {
    if (!story || !story.id) return;
    
    viewStory(story.id).catch(e => console.log("View err:", e));

    setLocalHasLiked(!!story.hasLiked);
    setLocalLikeCount(story.likeCount || 0);

    if (isOwner) {
      getStoryInsights(story.id)
        .then((res) => setStoryInsights(res))
        .catch(console.error);
    }
  }, [currentIndex, story, isOwner]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!story) return;
    const previousHasLiked = localHasLiked;
    const previousLikeCount = localLikeCount;

    setLocalHasLiked(!previousHasLiked);
    setLocalLikeCount(previousHasLiked ? previousLikeCount - 1 : previousLikeCount + 1);

    try {
        if (previousHasLiked) {
            await unlikeStory(story.id);
        } else {
            await likeStory(story.id);
        }
    } catch (err) {
        setLocalHasLiked(previousHasLiked);
        setLocalLikeCount(previousLikeCount);
    }
  };

  if (!stories.length || !story) return null;

  const viewers = storyInsights.viewers || [];
  const likersIds = new Set((storyInsights.likers || []).map(l => l.userId));

  const goPrev = () => {
    if (currentIndex > 0) onChangeIndex(currentIndex - 1);
  };

  const goNext = () => {
    if (currentIndex < stories.length - 1) onChangeIndex(currentIndex + 1);
    else onClose();
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
                <img src={story.profileImageUrl} alt={story.username} style={styles.avatar} />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  {story.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <span style={styles.username}>{story.username}</span>
            </div>

            <button style={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div style={styles.mediaArea}>
          {!isVideo ? (
            <img src={story.mediaUrl} alt="story" style={styles.media} />
          ) : (
            <video src={story.mediaUrl} controls autoPlay style={styles.media} onEnded={goNext} />
          )}
        </div>

        {!isOwner ? (
          <div style={styles.bottomBar}>
            <button style={styles.likeBtn} onClick={handleLike}>
              {localHasLiked ? "❤️" : "🤍"} <span style={{fontSize: "14px", marginLeft: "4px", color: "white"}}>{localLikeCount}</span>
            </button>
          </div>
        ) : (
          <div style={styles.bottomBar}>
            <button style={styles.showBtn} onClick={() => setShowViewers((p) => !p)}>
              {showViewers ? "Hide insights" : `👁️ ${storyInsights.viewCount}   |   ❤️ ${storyInsights.likeCount}`}
            </button>
          </div>
        )}

        {isOwner && showViewers && (
          <div style={styles.viewersPanel}>
            <div style={styles.viewersTitle}>Views & Likes</div>

            {viewers.length === 0 ? (
              <div style={styles.emptyViewers}>No viewer data available</div>
            ) : (
              viewers.map((viewer, index) => {
                const hasLikedView = likersIds.has(viewer.userId);
                return (
                  <div key={viewer.id || viewer.email || index} style={styles.viewerRow}>
                    <div style={styles.viewerAvatar}>
                      {viewer.profileImageUrl ? (
                        <img
                          src={viewer.profileImageUrl}
                          alt={viewer.username || viewer.email || "viewer"}
                          style={styles.viewerAvatarImg}
                        />
                      ) : (
                        <div style={styles.viewerAvatarFallback}>
                          {(viewer.username || viewer.email || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div style={styles.viewerMeta}>
                      <div style={styles.viewerName}>{viewer.username || "User"}</div>
                      <div style={styles.viewerEmail}>{viewer.email || ""}</div>
                    </div>
                    {hasLikedView && <div style={{marginLeft:"auto"}}>❤️</div>}
                  </div>
                );
              })
            )}
          </div>
        )}

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

        <button
          style={{ ...styles.navBtn, right: isMobile ? "8px" : "12px", opacity: currentIndex === stories.length - 1 ? 0.45 : 1 }}
          onClick={goNext}
        >
          ›
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 3000 },
  viewer: { position: "relative", background: "#111827", overflow: "hidden", display: "flex", flexDirection: "column" },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "12px" },
  progressWrap: { display: "flex", gap: "6px", marginBottom: "12px" },
  progressTrack: { flex: 1, height: "4px", background: "rgba(255,255,255,0.25)", borderRadius: "999px", overflow: "hidden" },
  progressFill: { height: "100%", background: "#ffffff", transition: "width 0.3s ease" },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  userInfo: { display: "flex", alignItems: "center", gap: "10px", color: "#ffffff" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" },
  avatarPlaceholder: { width: "36px", height: "36px", borderRadius: "50%", background: "#dbeafe", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" },
  username: { fontWeight: "700", fontSize: "14px" },
  closeBtn: { border: "none", background: "transparent", color: "#ffffff", fontSize: "24px", cursor: "pointer" },
  mediaArea: { flex: 1, width: "100%", height: "100%" },
  media: { width: "100%", height: "100%", objectFit: "contain", background: "#000000" },
  bottomBar: { position: "absolute", bottom: "35px", left: "12px", right: "12px", zIndex: 20, display: "flex", justifyContent: "center" },
  showBtn: { border: "none", background: "rgba(17, 24, 39, 0.85)", color: "#ffffff", padding: "10px 14px", borderRadius: "12px", cursor: "pointer", fontWeight: "600" },
  likeBtn: { display: "flex", alignItems: "center", border: "1px solid rgba(255, 255, 255, 0.4)", background: "rgba(17, 24, 39, 0.6)", color: "#ffffff", padding: "12px 18px", borderRadius: "99px", cursor: "pointer", fontSize: "20px"},
  viewersPanel: { position: "absolute", left: "12px", right: "12px", bottom: "85px", maxHeight: "220px", overflowY: "auto", background: "rgba(17, 24, 39, 0.92)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "12px", zIndex: 25 },
  viewersTitle: { color: "#ffffff", fontWeight: "700", marginBottom: "10px" },
  emptyViewers: { color: "#d1d5db", fontSize: "14px" },
  viewerRow: { display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  viewerAvatar: { width: "38px", height: "38px" },
  viewerAvatarImg: { width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" },
  viewerAvatarFallback: { width: "38px", height: "38px", borderRadius: "50%", background: "#dbeafe", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" },
  viewerMeta: { minWidth: 0 },
  viewerName: { color: "#ffffff", fontWeight: "600", fontSize: "14px" },
  viewerEmail: { color: "#d1d5db", fontSize: "12px", wordBreak: "break-word" },
  navBtn: { position: "absolute", top: "50%", transform: "translateY(-50%)", border: "none", background: "rgba(255,255,255,0.28)", color: "#ffffff", width: "42px", height: "42px", borderRadius: "50%", fontSize: "28px", lineHeight: "42px", textAlign: "center", cursor: "pointer", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center" },
};

export default StoryViewer;