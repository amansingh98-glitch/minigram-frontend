import React, { useEffect, useRef, useState } from "react";
import { toggleLike } from "../services/likeService";
import { addComment, deleteComment } from "../services/postService";
import CommentModal from "../components/CommentModal";

const ReelItem = ({ post, isActive, isMobile, onCommentChange }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [liked, setLiked] = useState(post.likedByCurrentUser || false);
  const [showComments, setShowComments] = useState(false);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState({});

  useEffect(() => {
    setLikeCount(post.likeCount || 0);
    setLiked(post.likedByCurrentUser || false);
  }, [post]);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const result = await toggleLike(post.id);
      setLikeCount(typeof result.likeCount === "number" ? result.likeCount : likeCount);
      setLiked(typeof result.liked === "boolean" ? result.liked : !liked);
    } catch (error) {
      console.error("Like toggle error:", error);
    }
  };

  const handleAddComment = async (postId, text) => {
    if (!text || !text.trim()) return;
    try {
      await addComment(postId, text);
      if (onCommentChange) onCommentChange();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setDeleteCommentLoading(prev => ({ ...prev, [commentId]: true }));
      await deleteComment(commentId);
      if (onCommentChange) onCommentChange();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteCommentLoading(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      const shareUrl = `${window.location.origin}`; // Basic sharing URL fallback
      const textToShare = `Check out this reel by ${post.userName} on MiniGram!`;

      if (navigator.share) {
        await navigator.share({
          title: "MiniGram Reel",
          text: textToShare,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(textToShare + " " + shareUrl);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  return (
    <div style={styles.reelWrapper(isMobile)}>
      <div style={styles.videoContainer} onClick={togglePlay}>
        <video
          ref={videoRef}
          src={post.videoUrl || post.imageUrl}
          style={styles.video}
          loop
          playsInline
        />
        
        {/* Play/Pause Icon Overlay */}
        {!isPlaying && (
          <div style={styles.playIconOverlay}>
            <div style={styles.playIcon}>▶</div>
          </div>
        )}

        {/* Right Action Bar */}
        <div style={styles.rightActionBar(isMobile)} onClick={e => e.stopPropagation()}>
          <div style={styles.actionItem} onClick={handleLike}>
            <div style={{ ...styles.actionIcon, color: liked ? "#ef4444" : "#ffffff" }}>
              {liked ? "❤️" : "🤍"}
            </div>
            <span style={styles.actionText}>{likeCount}</span>
          </div>

          <div style={styles.actionItem} onClick={() => setShowComments(true)}>
            <div style={styles.actionIcon}>💬</div>
            <span style={styles.actionText}>{post.comments?.length || 0}</span>
          </div>

          <div style={styles.actionItem} onClick={handleShare}>
            <div style={styles.actionIcon}>
              {/* Airplane/Share SVG inspired by Instagram */}
              <svg aria-label="Share" color="#ffffff" fill="#ffffff" height="24" role="img" viewBox="0 0 24 24" width="24" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
                <line fill="none" stroke="#ffffff" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line>
                <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="#ffffff" strokeLinejoin="round" strokeWidth="2"></polygon>
              </svg>
            </div>
            <span style={styles.actionText}>Share</span>
          </div>
        </div>

        {/* Bottom Info Bar */}
        <div style={styles.bottomInfoBar} onClick={e => e.stopPropagation()}>
          <div style={styles.userInfo}>
            {post.profileImageUrl ? (
              <img src={post.profileImageUrl} alt="user" style={styles.avatar} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                {(post.userName || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <span style={styles.userName}>{post.userName}</span>
          </div>
          {post.content && (
            <div style={styles.postDescription}>
              {post.content}
            </div>
          )}
        </div>
      </div>

      <CommentModal
        post={post}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        deleteLoadingMap={deleteCommentLoading}
      />
    </div>
  );
};

const ReelsPage = ({ posts, onUpdate }) => {
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const containerRef = useRef(null);

  const videoPosts = posts.filter(p => {
    const mediaUrl = p.videoUrl || p.imageUrl;
    if (!mediaUrl) return false;
    return mediaUrl.match(/\.(mp4|webm|ogg)$/i) != null;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const scrollRatio = scrollTop / clientHeight;
    // Calculate nearest active index based on scroll position safely
    const newIndex = Math.round(scrollRatio);
    if (newIndex !== activeReelIndex && newIndex >= 0 && newIndex < videoPosts.length) {
      setActiveReelIndex(newIndex);
    }
  };

  if (!videoPosts.length) {
    return (
      <div style={styles.emptyContainer}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🎬</div>
        <h2>No Reels yet!</h2>
        <p style={{ color: "#6b7280" }}>Upload some short videos to create reels.</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer(isMobile)}>
      <div 
        ref={containerRef}
        style={styles.scrollContainer}
        onScroll={handleScroll}
      >
        {videoPosts.map((post, index) => (
          <ReelItem
            key={post.id}
            post={post}
            isActive={index === activeReelIndex}
            isMobile={isMobile}
            onCommentChange={onUpdate}
          />
        ))}
      </div>
    </div>
  );
};

const styles = {
  pageContainer: (isMobile) => ({
    width: "100%",
    height: isMobile ? "calc(100vh - 84px - 76px)" : "calc(100vh - 105px)", 
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827", // Dark background for reels page
    borderRadius: isMobile ? "0px" : "24px",
    overflow: "hidden",
  }),
  emptyContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
    textAlign: "center",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    border: "1px solid #e5e7eb",
  },
  scrollContainer: {
    width: "100%",
    maxWidth: "480px",
    height: "100%",
    overflowY: "scroll",
    scrollSnapType: "y mandatory",
    scrollbarWidth: "none", // Firefox
    msOverflowStyle: "none", // IE and Edge
  },
  reelWrapper: (isMobile) => ({
    width: "100%",
    height: "100%",
    scrollSnapAlign: "start",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: "#000000",
  }),
  videoContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    cursor: "pointer",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  playIconOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    pointerEvents: "none",
  },
  playIcon: {
    fontSize: "64px",
    color: "rgba(255,255,255,0.7)",
  },
  rightActionBar: (isMobile) => ({
    position: "absolute",
    right: isMobile ? "12px" : "16px",
    bottom: isMobile ? "90px" : "80px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    zIndex: 10,
  }),
  actionItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },
  actionIcon: {
    fontSize: "28px",
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
  },
  actionText: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#ffffff",
    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
  },
  bottomInfoBar: {
    position: "absolute",
    left: 0,
    right: "60px",
    bottom: "20px",
    padding: "0 16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    zIndex: 10,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #ffffff",
  },
  avatarPlaceholder: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "18px",
    border: "2px solid #ffffff",
  },
  userName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#ffffff",
    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
  },
  postDescription: {
    color: "#ffffff",
    fontSize: "14px",
    lineHeight: "1.4",
    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
};

export default ReelsPage;
