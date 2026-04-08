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

  useEffect(() => {
    setLikeCount(post.likeCount || 0);
    setLiked(post.likedByCurrentUser || false);
  }, [post]);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
    else { videoRef.current.play().catch(() => {}); setIsPlaying(true); }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const res = await toggleLike(post.id);
      setLikeCount(res.likeCount);
      setLiked(res.liked);
    } catch (e) {}
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const url = window.location.origin;
    if (navigator.share) {
      await navigator.share({ title: "MiniGram", text: "Check this out!", url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  };

  return (
    <div style={styles.reelWrapper}>
      <div style={styles.videoContainer} onClick={togglePlay}>
        <video
          ref={videoRef}
          src={post.videoUrl || post.imageUrl}
          style={styles.video}
          loop
          playsInline
        />
        
        {!isPlaying && <div style={styles.playOverlay}>▶</div>}

        {/* Info Overlay */}
        <div style={styles.infoOverlay} onClick={e => e.stopPropagation()}>
           <div style={styles.userInfo}>
              {post.profileImageUrl ? (
                <img src={post.profileImageUrl} style={styles.avatar} alt="u" />
              ) : (
                <div style={styles.avatarInit}>{post.userName?.charAt(0)}</div>
              )}
              <span style={styles.userName}>{post.userName}</span>
           </div>
           <p style={styles.caption}>{post.content}</p>
        </div>

        {/* Action Sidebar */}
        <div style={styles.actionSidebar} onClick={e => e.stopPropagation()}>
           <div style={styles.actionItem} onClick={handleLike}>
              <div style={{ ...styles.actionCircle, background: liked ? "rgba(239, 68, 68, 0.9)" : "rgba(255,255,255,0.15)" }}>
                {liked ? "❤️" : "🤍"}
              </div>
              <span style={styles.actionCount}>{likeCount}</span>
           </div>
           
           <div style={styles.actionItem} onClick={() => setShowComments(true)}>
              <div style={styles.actionCircle}>💬</div>
              <span style={styles.actionCount}>{post.comments?.length || 0}</span>
           </div>

           <div style={styles.actionItem} onClick={handleShare}>
              <div style={styles.actionCircle}>↗️</div>
              <span style={styles.actionCount}>Share</span>
           </div>
        </div>
      </div>

      <CommentModal
        post={post}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onAddComment={async (p, t) => { await addComment(p, t); onCommentChange(); }}
        onDeleteComment={async (c) => { await deleteComment(c); onCommentChange(); }}
        deleteLoadingMap={{}}
      />
    </div>
  );
};

const ReelsPage = ({ posts, onUpdate }) => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoPosts = posts.filter(p => (p.videoUrl || p.imageUrl)?.match(/\.(mp4|webm|ogg|mov)$/i));

  const handleScroll = () => {
    if (!containerRef.current) return;
    setActiveIndex(Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight));
  };

  if (!videoPosts.length) {
    return (
      <div style={styles.empty}>
        <div style={{ fontSize: "60px", marginBottom: "20px" }}>🎬</div>
        <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", margin: "0 0 8px" }}>No Reels Found</h2>
        <p style={{ color: "#64748b", fontWeight: "500" }}>Be the first to share an immersive moment!</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div ref={containerRef} style={styles.scrollBox} onScroll={handleScroll}>
        {videoPosts.map((p, i) => (
          <ReelItem key={p.id} post={p} isActive={i === activeIndex} onCommentChange={onUpdate} />
        ))}
      </div>
    </div>
  );
};

const styles = {
  page: { 
    width: "100%", 
    height: "calc(100vh - 100px)", 
    display: "flex", 
    justifyContent: "center", 
    background: "#000",
    borderRadius: "32px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
  },
  scrollBox: {
    width: "100%", maxWidth: "450px", height: "100%", overflowY: "scroll",
    scrollSnapType: "y mandatory", scrollbarWidth: "none", msOverflowStyle: "none"
  },
  reelWrapper: { width: "100%", height: "100%", scrollSnapAlign: "start", position: "relative" },
  videoContainer: { width: "100%", height: "100%", position: "relative", cursor: "pointer" },
  video: { width: "100%", height: "100%", objectFit: "cover" },
  playOverlay: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "70px", color: "rgba(255,255,255,0.3)", pointerEvents: "none", background: "rgba(0,0,0,0.1)" },
  infoOverlay: { 
    position: "absolute", 
    bottom: "0", 
    left: "0", 
    right: "0", 
    padding: "60px 20px 40px",
    background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
    color: "#fff", 
    zIndex: 10 
  },
  userInfo: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" },
  avatar: { width: "44px", height: "44px", borderRadius: "15px", border: "2px solid rgba(255,255,255,0.5)", objectFit: "cover" },
  avatarInit: { width: "44px", height: "44px", borderRadius: "15px", border: "2px solid rgba(255,255,255,0.5)", background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800" },
  userName: { fontWeight: "800", fontSize: "16px", letterSpacing: "-0.3px" },
  caption: { fontSize: "14px", margin: 0, opacity: 0.95, lineHeight: "1.5", fontWeight: "500", display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden" },
  actionSidebar: { position: "absolute", bottom: "40px", right: "12px", display: "flex", flexDirection: "column", gap: "22px", alignItems: "center", zIndex: 10 },
  actionItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
  actionCircle: { 
    width: "50px", 
    height: "50px", 
    borderRadius: "50%", 
    background: "rgba(255,255,255,0.15)", 
    backdropFilter: "blur(20px)", 
    WebkitBackdropFilter: "blur(20px)", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    fontSize: "22px", 
    border: "1px solid rgba(255,255,255,0.25)", 
    cursor: "pointer",
    transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    ":active": { transform: "scale(0.9)" }
  },
  actionCount: { fontSize: "12px", color: "#fff", fontWeight: "800", textShadow: "0 2px 8px rgba(0,0,0,0.5)" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", textAlign: "center", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(20px)", borderRadius: "40px", border: "1px solid rgba(255,255,255,0.4)" }
};

export default ReelsPage;
