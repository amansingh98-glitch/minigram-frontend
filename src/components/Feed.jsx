import React, { useEffect, useState } from "react";
import {
  addComment,
  deleteComment,
  deletePost,
} from "../services/postService";
import { toggleLike, getLikes } from "../services/likeService.js";
import { toggleFollow } from "../services/followService.js";

import CommentModal from "./CommentModal";
import UserListModal from "./UserListModal";
import "../styles/UserListModal.css";

const Feed = ({
  posts = [],
  loading,
  onCommentAdded,
  onUserClick,
  onMessageUser,
}) => {
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [likeLoading, setLikeLoading] = useState({});
  const [deletePostLoading, setDeletePostLoading] = useState({});
  const [deleteCommentLoading, setDeleteCommentLoading] = useState({});
  const [activeDropdownPostId, setActiveDropdownPostId] = useState(null);
  const [localPosts, setLocalPosts] = useState(posts);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [userListTitle, setUserListTitle] = useState("");
  const [userListData, setUserListData] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".three-dot-menu-container")) {
        setActiveDropdownPostId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAddComment = async (postId, text) => {
    if (!text || !text.trim()) return;

    try {
      await addComment(postId, text);

      if (onCommentAdded) {
        await onCommentAdded();
      }
    } catch (error) {
      console.error("Comment add error:", error);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      setLikeLoading((prev) => ({ ...prev, [postId]: true }));
      const result = await toggleLike(postId);

      setLocalPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likeCount:
                  typeof result.likeCount === "number"
                    ? result.likeCount
                    : post.likeCount,
                likedByCurrentUser:
                  typeof result.liked === "boolean"
                    ? result.liked
                    : !post.likedByCurrentUser,
              }
            : post
        )
      );
    } catch (error) {
      console.error("Like toggle error:", error);
    } finally {
      setLikeLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      setDeletePostLoading((prev) => ({ ...prev, [postId]: true }));
      await deletePost(postId);

      setLocalPosts((prev) => prev.filter((post) => post.id !== postId));

      if (onCommentAdded) {
        await onCommentAdded();
      }
    } catch (error) {
      console.error("Post delete error:", error);
      alert("Failed to delete post");
    } finally {
      setDeletePostLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setDeleteCommentLoading((prev) => ({ ...prev, [commentId]: true }));
      await deleteComment(commentId);

      if (onCommentAdded) {
        await onCommentAdded();
      }
    } catch (error) {
      console.error("Comment delete error:", error);
      alert("Failed to delete comment");
    } finally {
      setDeleteCommentLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleShowLikes = async (postId) => {
    try {
      setListLoading(true);
      setUserListTitle("Likes");
      setIsUserListOpen(true);
      const data = await getLikes(postId);
      setUserListData(data);
    } catch (error) {
      console.error("Fetch likes error:", error);
    } finally {
      setListLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.infoCard}>Loading posts...</div>;
  }

  if (!localPosts.length) {
    return <div style={styles.infoCard}>No posts yet.</div>;
  }

  return (
    <div style={styles.feedWrap}>
      {localPosts.map((post) => {
        const mediaUrl = post.imageUrl || post.videoUrl;
        const isVideo =
          mediaUrl &&
          (mediaUrl.endsWith(".mp4") ||
            mediaUrl.endsWith(".webm") ||
            mediaUrl.endsWith(".ogg"));

        return (
          <div
            key={post.id}
            id={`post-${post.id}`}
            style={{
              ...styles.postCard,
              borderRadius: isMobile ? "18px" : "24px",
            }}
          >
            <div
              style={{
                ...styles.postHeader,
                flexDirection: isMobile ? "row" : "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: isMobile ? "12px" : "16px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ ...styles.headerTopRow, flex: 1 }}>
                {post.profileImageUrl ? (
                  <img
                    src={post.profileImageUrl}
                    alt={post.userName}
                    style={styles.avatar}
                    onClick={() => onUserClick && onUserClick(post.userId)}
                  />
                ) : (
                  <div
                    style={styles.avatarPlaceholder}
                    onClick={() => onUserClick && onUserClick(post.userId)}
                  >
                    {(post.userName || "U").charAt(0).toUpperCase()}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={styles.userName}
                    onClick={() => onUserClick && onUserClick(post.userId)}
                  >
                    {post.userName}
                  </div>
                </div>
              </div>

              <div
                className="three-dot-menu-container"
                style={{
                  ...styles.topActionWrap,
                  width: "auto",
                  justifyContent: "flex-end",
                  position: "relative",
                  alignItems: "center"
                }}
              >
                <button
                  style={styles.messageButton}
                  onClick={() =>
                    onMessageUser &&
                    onMessageUser({
                      userId: post.userId,
                      username: post.userName,
                      email: post.userEmail,
                      profileImageUrl: post.profileImageUrl,
                    })
                  }
                >
                  Message
                </button>

                {post.currentUserPost && (
                  <div style={{ position: "relative" }}>
                    <button
                      style={styles.threeDotBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownPostId(
                          activeDropdownPostId === post.id ? null : post.id
                        );
                      }}
                    >
                      ⋮
                    </button>
                    {activeDropdownPostId === post.id && (
                      <div style={styles.dropdownMenu}>
                        <button
                          style={styles.dropdownDeleteBtn}
                          onClick={() => {
                            setActiveDropdownPostId(null);
                            handleDeletePost(post.id);
                          }}
                          disabled={deletePostLoading[post.id]}
                        >
                          {deletePostLoading[post.id] ? "Deleting..." : "Delete Post"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {post.content && (
              <div
                style={{
                  ...styles.postContent,
                  padding: isMobile ? "0 12px 12px 12px" : "0 16px 14px 16px",
                }}
              >
                {post.content}
              </div>
            )}

            {mediaUrl && (
              <div style={styles.mediaWrap}>
                {isVideo ? (
                  <video
                    style={{
                      ...styles.media,
                      maxHeight: isMobile ? "300px" : "520px",
                    }}
                    controls
                  >
                    <source src={mediaUrl} />
                  </video>
                ) : (
                  <img
                    src={mediaUrl}
                    alt="post"
                    style={{
                      ...styles.media,
                      maxHeight: isMobile ? "300px" : "520px",
                    }}
                  />
                )}
              </div>
            )}

            <div
              style={{
                ...styles.footer,
                padding: isMobile ? "12px" : "14px 16px 16px 16px",
              }}
            >
              <div style={styles.actions}>
                <button
                  style={{
                    ...styles.actionBtn,
                    ...(post.likedByCurrentUser ? styles.likedBtn : {}),
                    flex: isMobile ? 1 : "unset",
                  }}
                  onClick={() => handleToggleLike(post.id)}
                  disabled={likeLoading[post.id]}
                >
                  {likeLoading[post.id]
                    ? "..."
                    : post.likedByCurrentUser
                    ? "❤️"
                    : "🤍"}
                </button>
                {post.likeCount > 0 && (
                  <span 
                    style={{ 
                      cursor: "pointer", 
                      fontSize: "14px", 
                      fontWeight: "600", 
                      color: "#374151",
                      alignSelf: "center",
                      marginLeft: "4px"
                    }}
                    onClick={() => handleShowLikes(post.id)}
                  >
                    {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
                  </span>
                )}

                <button
                  style={{
                    ...styles.secondaryBtn,
                    flex: isMobile ? 1 : "unset",
                  }}
                  onClick={() => setActiveCommentPostId(post.id)}
                >
                  💬 {(post.comments && post.comments.length) || 0}
                </button>
              </div>

              {/* The Comments Bottom Sheet / Modal */}
              <CommentModal
                post={post}
                isOpen={activeCommentPostId === post.id}
                onClose={() => setActiveCommentPostId(null)}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                deleteLoadingMap={deleteCommentLoading}
              />
            </div>
          </div>
        );
      })}

      <UserListModal 
        isOpen={isUserListOpen}
        onClose={() => setIsUserListOpen(false)}
        title={userListTitle}
        users={userListData}
        onToggleFollow={async (id) => {
            await toggleFollow(id);
            // We don't have a specific post ID here easily available without more state, 
            // but we can refresh the list by re-fetching if we store the current active post ID
            // For now, let's just update the local state of the user in the list
            setUserListData(prev => prev.map(u => u.id === id ? {...u, followedByCurrentUser: !u.followedByCurrentUser} : u));
        }}
      />
    </div>
  );
};

const styles = {
  feedWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    width: "100%",
  },

  infoCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    padding: "20px",
    color: "#6b7280",
  },

  postCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    width: "100%",
  },

  postHeader: {
    display: "flex",
    gap: "12px",
  },

  headerTopRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    minWidth: 0,
  },

  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    objectFit: "cover",
    cursor: "pointer",
    flexShrink: 0,
  },

  avatarPlaceholder: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    cursor: "pointer",
    flexShrink: 0,
  },

  userName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1f2937",
    cursor: "pointer",
    wordBreak: "break-word",
  },

  topActionWrap: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  messageButton: {
    border: "none",
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "8px 12px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },

  threeDotBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    fontWeight: "800",
    color: "#6b7280",
    cursor: "pointer",
    padding: "4px 8px",
    lineHeight: 1,
  },

  dropdownMenu: {
    position: "absolute",
    top: "30px",
    right: "0",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    padding: "6px",
    zIndex: 10,
    minWidth: "130px",
  },

  dropdownDeleteBtn: {
    width: "100%",
    border: "none",
    background: "#fef2f2",
    color: "#dc2626",
    padding: "10px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    textAlign: "left",
  },

  postContent: {
    color: "#1f2937",
    lineHeight: "1.5",
    wordBreak: "break-word",
  },

  mediaWrap: {
    width: "100%",
    background: "#f3f4f6",
  },

  media: {
    width: "100%",
    objectFit: "cover",
    display: "block",
  },

  footer: {
    borderTop: "1px solid #f1f5f9",
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "12px",
  },

  actionBtn: {
    border: "none",
    background: "#f3f4f6",
    color: "#374151",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },

  likedBtn: {
    background: "#fef2f2",
    color: "#dc2626",
  },

  secondaryBtn: {
    border: "none",
    background: "#f3f4f6",
    color: "#374151",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },

  commentBar: {
    display: "flex",
    gap: "10px",
    width: "100%",
  },

  commentInput: {
    flex: 1,
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    padding: "10px 12px",
    outline: "none",
    boxSizing: "border-box",
  },

  commentBtn: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },

  commentList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "12px",
  },

  commentItem: {
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "10px 12px",
  },

  commentTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },

  commentUser: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1f2937",
    wordBreak: "break-word",
  },

  commentDeleteBtn: {
    border: "none",
    background: "#fee2e2",
    color: "#dc2626",
    padding: "6px 10px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },

  commentText: {
    fontSize: "14px",
    color: "#374151",
    marginTop: "6px",
    wordBreak: "break-word",
  },
};

export default Feed;