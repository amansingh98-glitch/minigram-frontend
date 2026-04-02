import React, { useRef } from "react";

const PostComposer = ({
  content,
  setContent,
  selectedImage,
  setSelectedImage,
  onCreatePost,
  message,
}) => {
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  return (
    <div className="card composer-card">
      <textarea
        className="composer-textarea"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="composer-actions">
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            className="small-btn secondary"
            type="button"
            onClick={() => fileRef.current?.click()}
          >
            📷 Add Photo/Video
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {selectedImage && (
            <div className="file-chip">
              <span>{selectedImage.name}</span>
              <button
                type="button"
                className="small-btn danger"
                onClick={() => setSelectedImage(null)}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <button className="primary-btn" onClick={onCreatePost}>
          Create Post
        </button>
      </div>

      {message && (
        <div style={{ marginTop: "12px", color: "#374151", fontSize: "14px" }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default PostComposer;