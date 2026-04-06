import React, { useEffect, useState, useRef } from "react";

const CommentModal = ({
  post,
  isOpen,
  onClose,
  onAddComment,
  onDeleteComment,
  deleteLoadingMap,
}) => {
  const [commentText, setCommentText] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const bottomRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !post) return null;

  const handleAdd = () => {
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText);
    setCommentText("");
  };

  return (
    <div
      style={styles.overlay}
      onClick={onClose}
    >
      <div
        style={styles.modalContent(isMobile)}
        onClick={(e) => e.stopPropagation()}
        className="comment-modal-content"
      >
        {isMobile && <div style={styles.dragHandle} onClick={onClose} />}

        <div style={styles.header}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>Comments</h3>
          {!isMobile && (
            <button style={styles.closeBtn} onClick={onClose}>
              ✖
            </button>
          )}
        </div>

        <div style={styles.commentListWrapper}>
          {post.comments && post.comments.length > 0 ? (
            <div style={styles.commentList}>
              {post.comments.map((comment, idx) => (
                <div key={idx} style={styles.commentItem}>
                  <div style={styles.commentTop}>
                    <div style={styles.commentUser}>{comment.userName}</div>
                    {comment.currentUserComment && (
                      <button
                        style={styles.commentDeleteBtn}
                        onClick={() => onDeleteComment(comment.id)}
                        disabled={deleteLoadingMap[comment.id]}
                      >
                        {deleteLoadingMap[comment.id] ? "..." : "Delete"}
                      </button>
                    )}
                  </div>
                  <div style={styles.commentText}>{comment.text}</div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          ) : (
            <div style={styles.emptyState}>No comments yet. Be the first to comment!</div>
          )}
        </div>

        <div style={styles.inputArea}>
          <input
            style={styles.input}
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
          <button style={styles.postBtn} onClick={handleAdd}>
            Post
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .comment-modal-content {
          animation: ${isMobile ? "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" : "fadeIn 0.2s ease-out"};
        }
      `}</style>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 99999,
    display: "flex",
    alignItems: "flex-end", // for bottom sheet
    justifyContent: "center",
  },
  modalContent: (isMobile) => ({
    backgroundColor: "#ffffff",
    width: "100%",
    maxWidth: isMobile ? "100%" : "500px",
    height: isMobile ? "70vh" : "60vh",
    maxHeight: "70vh",
    margin: isMobile ? "0" : "auto",
    marginBottom: isMobile ? "0" : "auto",
    borderRadius: isMobile ? "24px 24px 0 0" : "20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
    position: "relative",
  }),
  dragHandle: {
    width: "40px",
    height: "5px",
    backgroundColor: "#d1d5db",
    borderRadius: "3px",
    margin: "12px auto",
    cursor: "pointer",
  },
  header: {
    padding: "16px",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "center",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#6b7280",
  },
  commentListWrapper: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    backgroundColor: "#fafafa",
  },
  commentList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  emptyState: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: "40px",
    fontSize: "15px",
  },
  commentItem: {
    display: "flex",
    flexDirection: "column",
  },
  commentTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commentUser: {
    fontWeight: "700",
    fontSize: "14px",
    color: "#1f2937",
  },
  commentText: {
    fontSize: "14px",
    color: "#374151",
    marginTop: "2px",
    lineHeight: "1.4",
  },
  commentDeleteBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "4px 0",
  },
  inputArea: {
    padding: "12px 16px",
    borderTop: "1px solid #f3f4f6",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "24px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "15px",
  },
  postBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
  },
};

export default CommentModal;
