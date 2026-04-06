import React, { useEffect, useRef, useState } from "react";
import {
  editProfile,
  getMyProfile,
  getUserProfile,
  uploadProfileImage,
} from "../services/userService";
import { toggleFollow as toggleFollowApi } from "../services/followService";
import { resolveMediaUrl } from "../utils/media";
import SinglePostModal from "../components/SinglePostModal";

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

  const fileRef = useRef(null);

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

  if (loading) {
    return <div style={styles.infoCard}>Loading profile...</div>;
  }

  if (!profile) {
    return <div style={styles.infoCard}>Profile not found</div>;
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerCard}>
        <div style={styles.top}>
          <div style={styles.imageSection}>
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={profile.username}
                style={styles.profileImage}
              />
            ) : (
              <div style={styles.profileImagePlaceholder}>
                {profile.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            {profile.currentUserProfile && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleProfileImageChange}
                />
                <button
                  style={styles.imageUploadBtn}
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? "Uploading..." : "Change Photo"}
                </button>
              </>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {editMode ? (
              <>
                <input
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Enter username"
                  style={styles.editInput}
                />

                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Write your bio"
                  style={styles.editTextarea}
                />
              </>
            ) : (
              <div style={styles.profileInfoText}>
                <div style={styles.userName}>{profile.username}</div>
                <div style={styles.bioText}>
                  {profile.bio?.trim() ? profile.bio : "No bio yet"}
                </div>
              </div>
            )}

            <div style={styles.stats}>
              <div style={styles.statBox}>
                <div style={styles.statNumber}>{profile.postsCount || 0}</div>
                <div style={styles.statLabel}>Posts</div>
              </div>

              <div style={styles.statBox}>
                <div style={styles.statNumber}>{profile.followersCount || 0}</div>
                <div style={styles.statLabel}>Followers</div>
              </div>

              <div style={styles.statBox}>
                <div style={styles.statNumber}>{profile.followingCount || 0}</div>
                <div style={styles.statLabel}>Following</div>
              </div>
            </div>

            {profile.currentUserProfile ? (
              <div style={styles.actions}>
                {editMode ? (
                  <>
                    <button
                      style={styles.followBtn}
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Profile"}
                    </button>

                    <button
                      style={styles.messageBtn}
                      onClick={() => {
                        setEditMode(false);
                        setEditUsername(profile.username || "");
                        setEditBio(profile.bio || "");
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    style={styles.followBtn}
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            ) : (
              <div style={styles.actions}>
                <button
                  style={styles.followBtn}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                >
                  {followLoading
                    ? "..."
                    : profile.followedByCurrentUser
                    ? "Following"
                    : "Follow"}
                </button>

                <button
                  style={styles.messageBtn}
                  onClick={() =>
                    onMessageUser &&
                    onMessageUser({
                      userId: profile.id,
                      username: profile.username,
                      email: profile.email,
                      profileImageUrl: profile.profileImageUrl,
                    })
                  }
                >
                  Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {profile.posts?.length > 0 && (
        <div style={styles.postsGrid}>
          {profile.posts.map((post) => (
            <div
              key={post.id}
              style={styles.postCard}
              onClick={() => setActivePost(post)}
            >
              {post.imageUrl ? (
                <img src={post.imageUrl} alt="post" style={styles.postImage} />
              ) : (
                <div style={styles.postContent}>{post.content}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Single Post Pop-up Modal */}
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

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    width: "100%",
    overflowX: "hidden",
  },
  infoCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    padding: "20px",
    color: "#6b7280",
    textAlign: "center",
  },
  headerCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    padding: "24px",
    overflow: "hidden",
  },
  top: {
    display: "flex",
    gap: "32px",
    alignItems: "flex-start",
    flexWrap: "wrap",
    width: "100%",
  },
  imageSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    flexShrink: 0,
  },
  profileImage: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #transparent",
    background: "linear-gradient(#fff, #fff) padding-box, linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888) border-box",
  },
  profileImagePlaceholder: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    fontWeight: "700",
  },
  imageUploadBtn: {
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "8px 12px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  profileInfoText: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px"
  },
  userName: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#1f2937",
    wordBreak: "break-word",
    marginBottom: "4px"
  },
  bioText: {
    fontSize: "15px",
    color: "#374151",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxWidth: "400px"
  },
  editInput: {
    width: "100%",
    maxWidth: "300px",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "16px",
    outline: "none",
    marginBottom: "12px",
  },
  editTextarea: {
    width: "100%",
    maxWidth: "300px",
    minHeight: "90px",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    marginBottom: "20px"
  },
  stats: {
    display: "flex",
    gap: "36px",
    marginBottom: "24px",
    flexWrap: "wrap"
  },
  statBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  statNumber: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "500",
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  followBtn: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 24px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "15px",
  },
  messageBtn: {
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#1f2937",
    padding: "10px 24px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "15px",
  },
  postsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "4px",
  },
  postCard: {
    background: "#f9fafb",
    position: "relative",
    aspectRatio: "1 / 1",
    overflow: "hidden",
    cursor: "pointer",
  },
  postImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  postContent: {
    padding: "16px",
    color: "#374151",
    lineHeight: "1.4",
    fontSize: "14px",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 4,
    WebkitBoxOrient: "vertical",
  },
};

export default ProfilePage;