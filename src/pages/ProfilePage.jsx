import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config";
import {
  editProfile,
  getMyProfile,
  getUserProfile,
  uploadProfileImage,
} from "../services/userService";
import { toggleFollow as toggleFollowApi } from "../services/followService";

const resolveImageUrl = (url) => {
  if (!url) return "";

  if (url.startsWith("http://localhost:8080")) {
    return url.replace("http://localhost:8080", API_BASE_URL);
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return url;
};

const ProfilePage = ({ userId, onMessageUser }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileRef = useRef(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = userId ? await getUserProfile(userId) : await getMyProfile();
      setProfile(data || null);
      setEditUsername(data?.username || "");
      setEditBio(data?.bio || "");
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
      await uploadProfileImage(file);
      await loadProfile();
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
                src={resolveImageUrl(profile.profileImageUrl)}
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
              <>
                <div style={styles.userName}>{profile.username}</div>
                <div style={styles.userEmail}>{profile.email}</div>
                <div style={styles.bioText}>
                  {profile.bio?.trim() ? profile.bio : "No bio yet"}
                </div>
              </>
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
                      profileImageUrl: resolveImageUrl(profile.profileImageUrl),
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
            <div key={post.id} style={styles.postCard}>
              {post.imageUrl ? (
                <img
                  src={resolveImageUrl(post.imageUrl)}
                  alt="post"
                  style={styles.postImage}
                />
              ) : (
                <div style={styles.postContent}>{post.content}</div>
              )}
            </div>
          ))}
        </div>
      )}
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
    gap: "24px",
    alignItems: "center",
    flexWrap: "wrap",
    width: "100%",
  },

  imageSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },

  profileImage: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #d1d5db",
  },

  profileImagePlaceholder: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "700",
  },

  imageUploadBtn: {
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },

  userName: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    wordBreak: "break-word",
  },

  userEmail: {
    color: "#6b7280",
    marginTop: "6px",
    fontSize: "15px",
    wordBreak: "break-word",
  },

  bioText: {
    marginTop: "12px",
    fontSize: "14px",
    color: "#374151",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },

  editInput: {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "16px",
    outline: "none",
  },

  editTextarea: {
    width: "100%",
    minHeight: "90px",
    marginTop: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
  },

  stats: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    marginTop: "16px",
  },

  statBox: {
    minWidth: "110px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "14px 18px",
    flex: "1 1 110px",
  },

  statNumber: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
  },

  statLabel: {
    fontSize: "14px",
    color: "#6b7280",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "18px",
    flexWrap: "wrap",
  },

  followBtn: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "12px 16px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
  },

  messageBtn: {
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "12px 16px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
  },

  postsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  postCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    overflow: "hidden",
    minHeight: "220px",
  },

  postImage: {
    width: "100%",
    height: "100%",
    maxHeight: "320px",
    objectFit: "cover",
  },

  postContent: {
    padding: "16px",
    color: "#374151",
    lineHeight: "1.5",
  },
};

export default ProfilePage;