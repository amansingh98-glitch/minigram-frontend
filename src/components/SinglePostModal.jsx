import React, { useEffect, useState } from "react";
import Feed from "./Feed";

const SinglePostModal = ({ post, isOpen, onClose, onUpdate }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !post) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      {/* 
        Container clicks should not bubble to overlay.
      */}
      <div
        style={styles.modalContent(isMobile)}
        onClick={(e) => e.stopPropagation()}
        className="single-post-modal-content"
      >
        <div style={styles.header}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
            Post Details
          </h3>
          <button style={styles.closeBtn} onClick={onClose}>
            ✖
          </button>
        </div>

        <div style={styles.feedWrapper}>
          <Feed posts={[post]} loading={false} onCommentAdded={onUpdate} />
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .single-post-modal-content {
          animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(4px)",
  },
  modalContent: (isMobile) => ({
    backgroundColor: "#ffffff",
    width: "100%",
    maxWidth: isMobile ? "100%" : "550px",
    height: isMobile ? "100%" : "auto",
    maxHeight: isMobile ? "100%" : "90vh",
    margin: isMobile ? "0" : "auto",
    borderRadius: isMobile ? "0" : "20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    position: "relative",
    overflow: "hidden",
  }),
  header: {
    padding: "16px",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: "#ffffff",
    zIndex: 10,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#6b7280",
    padding: "4px",
  },
  feedWrapper: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    backgroundColor: "#f9fafb",
  },
};

export default SinglePostModal;
