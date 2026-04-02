import React, { useEffect, useState } from "react";
import { changePassword, deleteAccount } from "../services/userService";

const SettingsPage = ({
  onOpenProfile,
  onOpenForgotPassword,
  onLogout,
}) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deletePassword, setDeletePassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const resetChangePasswordForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const resetDeleteForm = () => {
    setDeletePassword("");
  };

  const handleCloseChangePasswordModal = () => {
    resetChangePasswordForm();
    setShowChangePassword(false);
  };

  const handleCloseDeleteModal = () => {
    resetDeleteForm();
    setShowDeleteAccount(false);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }

    try {
      setSaving(true);
      const msg = await changePassword(oldPassword, newPassword);
      alert(msg || "Password updated successfully");
      handleCloseChangePasswordModal();
    } catch (error) {
      console.error("Change password error:", error);
      alert(error.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert("Please enter your password");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete your account?"
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);
      const msg = await deleteAccount(deletePassword);
      alert(msg || "Account deleted successfully");

      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("username");
      localStorage.removeItem("userName");
      localStorage.removeItem("name");
      localStorage.removeItem("profileImageUrl");

      onLogout();
    } catch (error) {
      console.error("Delete account error:", error);
      alert(error.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div
        style={{
          ...styles.headerCard,
          padding: isMobile ? "16px" : "24px",
          borderRadius: isMobile ? "18px" : "24px",
        }}
      >
        <h2
          style={{
            ...styles.title,
            fontSize: isMobile ? "22px" : "28px",
          }}
        >
          Settings
        </h2>
        <p style={styles.subtitle}>
          Manage your account, profile and security settings.
        </p>
      </div>

      <div
        style={{
          ...styles.grid,
          gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(auto-fit, minmax(260px, 1fr))",
          gap: isMobile ? "12px" : "16px",
        }}
      >
        <div style={styles.card}>
          <div style={styles.cardTitle}>Edit Profile</div>
          <div style={styles.cardText}>
            Update your username, bio and profile photo.
          </div>
          <button style={styles.primaryBtn} onClick={onOpenProfile}>
            Open Profile
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Change Password</div>
          <div style={styles.cardText}>
            Change your current password to keep your account secure.
          </div>
          <button
            style={styles.primaryBtn}
            onClick={() => setShowChangePassword(true)}
          >
            Change Password
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Forgot Password</div>
          <div style={styles.cardText}>
            Reset password using OTP on your registered email.
          </div>
          <button style={styles.secondaryBtn} onClick={onOpenForgotPassword}>
            Forgot Password
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Logout</div>
          <div style={styles.cardText}>
            Sign out from your current MiniGram session.
          </div>
          <button style={styles.secondaryBtn} onClick={onLogout}>
            Logout
          </button>
        </div>

        <div style={{ ...styles.card, ...styles.dangerCard }}>
          <div style={styles.cardTitle}>Delete Account</div>
          <div style={styles.cardText}>
            Permanently delete your account and related data.
          </div>
          <button
            style={styles.dangerBtn}
            onClick={() => setShowDeleteAccount(true)}
          >
            Delete Account
          </button>
        </div>
      </div>

      {showChangePassword && (
        <div style={styles.modalOverlay}>
          <div
            style={{
              ...styles.modalCard,
              width: isMobile ? "92%" : "420px",
              padding: isMobile ? "16px" : "20px",
            }}
          >
            <h3 style={styles.modalTitle}>Change Password</h3>

            <input
              type="password"
              placeholder="Enter old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              style={styles.input}
            />

            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
            />

            <div
              style={{
                ...styles.modalActions,
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <button
                style={{
                  ...styles.primaryBtn,
                  width: isMobile ? "100%" : "auto",
                }}
                onClick={handleChangePassword}
                disabled={saving}
              >
                {saving ? "Saving..." : "Update Password"}
              </button>

              <button
                style={{
                  ...styles.secondaryBtn,
                  width: isMobile ? "100%" : "auto",
                }}
                onClick={handleCloseChangePasswordModal}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccount && (
        <div style={styles.modalOverlay}>
          <div
            style={{
              ...styles.modalCard,
              width: isMobile ? "92%" : "420px",
              padding: isMobile ? "16px" : "20px",
            }}
          >
            <h3 style={{ ...styles.modalTitle, color: "#dc2626" }}>
              Delete Account
            </h3>

            <p style={styles.deleteWarning}>
              This action is permanent. Enter your password to continue.
            </p>

            <input
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              style={styles.input}
            />

            <div
              style={{
                ...styles.modalActions,
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <button
                style={{
                  ...styles.dangerBtn,
                  width: isMobile ? "100%" : "auto",
                }}
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>

              <button
                style={{
                  ...styles.secondaryBtn,
                  width: isMobile ? "100%" : "auto",
                }}
                onClick={handleCloseDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
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
  },

  headerCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
  },

  title: {
    margin: 0,
    fontWeight: "700",
    color: "#1f2937",
  },

  subtitle: {
    margin: "8px 0 0 0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  grid: {
    display: "grid",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  dangerCard: {
    border: "1px solid #fecaca",
    background: "#fffafa",
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1f2937",
  },

  cardText: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.5",
    wordBreak: "break-word",
  },

  primaryBtn: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "12px 16px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
  },

  secondaryBtn: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    padding: "12px 16px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
  },

  dangerBtn: {
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    padding: "12px 16px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: "16px",
  },

  modalCard: {
    background: "#ffffff",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
    boxSizing: "border-box",
  },

  modalTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#1f2937",
  },

  deleteWarning: {
    margin: 0,
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.5",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },

  modalActions: {
    display: "flex",
    gap: "10px",
    marginTop: "6px",
  },
};

export default SettingsPage;