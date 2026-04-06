import React, { useEffect, useRef, useState } from "react";
import {
  editProfile,
  getMyProfile,
  getUserProfile,
  uploadProfileImage,
} from "../services/userService";
import { toggleFollow as toggleFollowApi } from "../services/followService";
import { resolveMediaUrl } from "../utils/media";
import { deletePost } from "../services/postService";
import SinglePostModal from "../components/SinglePostModal";
import "../styles/ProfilePage.css";

const ProfilePage = ({ userId, onMessageUser }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [hoveredPostId, setHoveredPostId] = useState(null);
  const [activeDropdownPostId, setActiveDropdownPostId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState({});

  const [activeTab, setActiveTab] = useState("grid");

  const fileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-abs-menu")) {
        setActiveDropdownPostId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = userId ? await getUserProfile(userId) : await getMyProfile();

      const normalized = data
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

      setProfile(normalized);
      setEditUsername(normalized?.username || "");
      setEditBio(normalized?.bio || "");

      if (!userId && normalized?.profileImageUrl) {
        localStorage.setItem("profileImageUrl", normalized.profileImageUrl);
      }
      if (!userId && normalized?.username) {
        localStorage.setItem("username", normalized.username);
      }
    } catch (error) {
      console.error("Profile load error:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!profile || profile.currentUserProfile) return;

    try {
      setFollowLoading(true);
      await toggleFollowApi(profile.id);
      await loadProfile();
    } catch (error) {
      console.error("Follow toggle error:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await editProfile({
        username: editUsername,
        bio: editBio,
      });
      setEditMode(false);
      await loadProfile();
    } catch (error) {
      console.error("Profile save error:", error);
      alert(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const uploadedUrl = await uploadProfileImage(file);
      if (uploadedUrl) {
        localStorage.setItem("profileImageUrl", resolveMediaUrl(uploadedUrl));
      }
      await loadProfile();
      window.dispatchEvent(new Event("profile-updated"));
    } catch (error) {
      console.error("Profile image upload error:", error);
      alert("Failed to upload profile image");
    } finally {
      setUploadingImage(false);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      setDeleteLoading((prev) => ({ ...prev, [postId]: true }));
      await deletePost(postId);
      setProfile((prev) => ({
        ...prev,
        posts: prev.posts.filter((p) => p.id !== postId),
        postsCount: Math.max(0, (prev.postsCount || 1) - 1)
      }));
    } catch (error) {
      console.error("Post delete error:", error);
      alert("Failed to delete post");
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [postId]: false }));
      setActiveDropdownPostId(null);
    }
  };

  if (loading) {
    return <div className="profile-container" style={{ padding: "20px", textAlign: "center" }}>Loading...</div>;
  }

  if (!profile) {
    return <div className="profile-container" style={{ padding: "20px", textAlign: "center" }}>User not found</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-main-header">
        <div className="profile-top-section">
          <div className="profile-avatar-wrapper" onClick={() => profile.currentUserProfile && fileRef.current?.click()}>
            <div className={`profile-avatar-ring ${!profile.hasUnseenStories ? 'no-story' : ''}`}>
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt="avatar" className="profile-avatar" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {profile.username?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            {profile.currentUserProfile && (
              <div className="profile-upload-btn">+</div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleProfileImageChange}
            />
          </div>

          <div className="profile-stats">
            <div className="profile-stat-box">
              <span className="profile-stat-number">{profile.postsCount || 0}</span>
              <span className="profile-stat-label">posts</span>
            </div>
            <div className="profile-stat-box">
              <span className="profile-stat-number">{profile.followersCount || 0}</span>
              <span className="profile-stat-label">followers</span>
            </div>
            <div className="profile-stat-box">
              <span className="profile-stat-number">{profile.followingCount || 0}</span>
              <span className="profile-stat-label">following</span>
            </div>
          </div>
        </div>

        <div className="profile-bio-section">
          <div className="profile-real-name">{profile.username}</div>
          {editMode ? (
            <>
              <input
                className="profile-edit-input"
                name="username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Username"
              />
              <textarea
                className="profile-edit-textarea"
                name="bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Bio"
              />
            </>
          ) : (
            <div className="profile-bio-text">{profile.bio}</div>
          )}
        </div>

        <div className="profile-actions">
          {profile.currentUserProfile ? (
            editMode ? (
              <>
                <button className="profile-action-btn primary" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button className="profile-action-btn" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button className="profile-action-btn" onClick={() => setEditMode(true)}>
                  Edit profile
                </button>
                <button className="profile-action-btn" onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  alert("Profile link copied!");
                }}>
                  Share profile
                </button>
              </>
            )
          ) : (
            <>
              <button 
                className={`profile-action-btn ${!profile.followedByCurrentUser ? 'primary' : ''}`}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading ? "..." : (profile.followedByCurrentUser ? "Following" : "Follow")}
              </button>
              <button 
                className="profile-action-btn"
                onClick={() => onMessageUser && onMessageUser({
                  userId: profile.id,
                  username: profile.username,
                  email: profile.email,
                  profileImageUrl: profile.profileImageUrl,
                })}
              >
                Message
              </button>
            </>
          )}
        </div>
      </div>

      <div className="profile-tabs">
        <div className={`profile-tab ${activeTab === 'grid' ? 'active' : ''}`} onClick={() => setActiveTab('grid')}>
          <span className="profile-tab-icon">▦</span>
        </div>
        <div className={`profile-tab ${activeTab === 'reels' ? 'active' : ''}`} onClick={() => setActiveTab('reels')}>
          <span className="profile-tab-icon">▶</span>
        </div>
        <div className={`profile-tab ${activeTab === 'tagged' ? 'active' : ''}`} onClick={() => setActiveTab('tagged')}>
          <span className="profile-tab-icon">웃</span>
        </div>
      </div>

      {activeTab === 'grid' && profile.posts?.length > 0 && (
        <div className="profile-posts-grid">
          {profile.posts.map((post) => (
            <div 
              key={post.id} 
              className="profile-post-card"
              onClick={() => setActivePost(post)}
              onMouseEnter={() => setHoveredPostId(post.id)}
              onMouseLeave={() => setHoveredPostId(null)}
            >
              {post.imageUrl ? (
                <img src={post.imageUrl} alt="post" className="profile-post-image" />
              ) : (
                <div className="profile-post-text">{post.content?.substring(0, 50)}...</div>
              )}

              {/* Hover overlay on desktop */}
              {hoveredPostId === post.id && (
                <div className="profile-post-overlay">
                  <div className="profile-post-overlay-stat">❤️ {post.likeCount || 0}</div>
                  <div className="profile-post-overlay-stat">💬 {post.comments?.length || 0}</div>
                </div>
              )}

               {/* Delete Menu */}
               {profile.currentUserProfile && (
                <div
                  className="profile-abs-menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="profile-three-dot-btn"
                    onClick={() => setActiveDropdownPostId(activeDropdownPostId === post.id ? null : post.id)}
                  >
                    ⋮
                  </button>
                  {activeDropdownPostId === post.id && (
                    <div className="profile-dropdown-menu">
                      <button
                        className="profile-dropdown-btn"
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deleteLoading[post.id]}
                      >
                        {deleteLoading[post.id] ? "Deleting..." : "Delete Post"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reels' && (
        <div style={{ textAlign: "center", padding: "40px", color: "#8e8e8e" }}>
          No reels yet.
        </div>
      )}

      {activeTab === 'tagged' && (
        <div style={{ textAlign: "center", padding: "40px", color: "#8e8e8e" }}>
          No tagged photos.
        </div>
      )}

      <SinglePostModal
        post={activePost}
        isOpen={!!activePost}
        onClose={() => {
          setActivePost(null);
          loadProfile();
        }}
        onUpdate={loadProfile}
      />
    </div>
  );
};

export default ProfilePage;