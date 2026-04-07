import React, { useEffect, useState } from "react";
import { changePassword, deleteAccount } from "../services/userService";
import {
  sendForgotPasswordOtp,
  resetPasswordWithOtp,
} from "../services/authService";

const SettingsPage = ({ onOpenProfile, onLogout }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // States for Password Change
  const [oldPassword, setOldPassword] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // States for Account Deletion
  const [deletePass, setDeletePass] = useState("");

  // States for Forgot Password (Internal)
  const [forgotEmail, setForgotEmail] = useState(
    localStorage.getItem("userEmail") || ""
  );
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [resetPass, setResetPass] = useState("");

  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPass || !confirmPass) {
      alert("Please fill all fields");
      return;
    }
    if (newPass !== confirmPass) {
      alert("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const msg = await changePassword(oldPassword, newPass);
      alert(msg || "Password updated successfully");
      setShowChangePassword(false);
      setOldPassword("");
      setNewPass("");
      setConfirmPass("");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtpInternal = async () => {
    if (!forgotEmail) {
      alert("Email is required");
      return;
    }
    try {
      setLoading(true);
      const msg = await sendForgotPasswordOtp(forgotEmail);
      alert(msg);
      setOtpSent(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordInternal = async () => {
    if (!otp || !resetPass) {
      alert("Please enter OTP and New Password");
      return;
    }
    try {
      setLoading(true);
      const msg = await resetPasswordWithOtp({
        email: forgotEmail,
        otp,
        newPassword: resetPass,
      });
      alert(msg);
      setShowForgotPassword(false);
      setOtpSent(false);
      setOtp("");
      setResetPass("");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePass) {
      alert("Enter password to confirm");
      return;
    }
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      setLoading(true);
      await deleteAccount(deletePass);
      onLogout();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderModal = (title, isOpen, onClose, content) => {
    if (!isOpen) return null;
    return (
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h3 style={styles.modalTitle}>{title}</h3>
          {content}
          <div style={styles.modalActions}>
            <button
              style={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.mainTitle}>Settings</h1>
        <p style={styles.subtitle}>Fine-tune your MiniGram experience</p>
      </header>

      <section style={styles.sectionGrid(isMobile)}>
        <div style={styles.glassCard} className="settings-card">
          <div style={styles.cardHeader}>
            <span style={styles.icon}>👤</span>
            <h2 style={styles.cardTitle}>Profile</h2>
          </div>
          <p style={styles.cardDesc}>Personalize your identity on the platform.</p>
          <button style={styles.actionBtn} onClick={onOpenProfile}>
            Edit Profile
          </button>
        </div>

        <div style={styles.glassCard} className="settings-card">
          <div style={styles.cardHeader}>
            <span style={styles.icon}>🔐</span>
            <h2 style={styles.cardTitle}>Security</h2>
          </div>
          <p style={styles.cardDesc}>Maintain a strong and secure account.</p>
          <div style={styles.buttonStack}>
            <button
              style={styles.actionBtn}
              onClick={() => setShowChangePassword(true)}
            >
              Change Password
            </button>
            <button
              style={styles.ghostBtn}
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </button>
          </div>
        </div>

        <div style={styles.glassCard} className="settings-card">
          <div style={styles.cardHeader}>
            <span style={styles.icon}>🚪</span>
            <h2 style={styles.cardTitle}>Session</h2>
          </div>
          <p style={styles.cardDesc}>Sign out from this browser safely.</p>
          <button
            style={{ ...styles.actionBtn, background: "#6366f1" }}
            onClick={onLogout}
          >
            Log Out
          </button>
        </div>

        <div style={{ ...styles.glassCard, ...styles.dangerCard }} className="settings-card">
          <div style={styles.cardHeader}>
            <span style={styles.icon}>⚠️</span>
            <h2 style={{ ...styles.cardTitle, color: "#ef4444" }}>Zone</h2>
          </div>
          <p style={styles.cardDesc}>Irreversible account deletion request.</p>
          <button
            style={{ ...styles.actionBtn, background: "#ef4444" }}
            onClick={() => setShowDeleteAccount(true)}
          >
            Delete Account
          </button>
        </div>
      </section>

      {/* Change Password Modal */}
      {renderModal(
        "Update Security",
        showChangePassword,
        () => setShowChangePassword(false),
        <div style={styles.form}>
          <input
            type="password"
            placeholder="Current Password"
            style={styles.input}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            style={styles.input}
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Pass"
            style={styles.input}
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />
          <button
            style={styles.primaryBtn}
            onClick={handleUpdatePassword}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      )}

      {/* Forgot Password Modal */}
      {renderModal(
        "Recover Account",
        showForgotPassword,
        () => setShowForgotPassword(false),
        <div style={styles.form}>
          <input
            type="email"
            placeholder="Registered Email"
            style={styles.input}
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
          />
          {otpSent && (
            <>
              <input
                type="text"
                placeholder="6-Digit OTP"
                style={styles.input}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <input
                type="password"
                placeholder="New Password"
                style={styles.input}
                value={resetPass}
                onChange={(e) => setResetPass(e.target.value)}
              />
            </>
          )}
          {!otpSent ? (
            <button
              style={styles.primaryBtn}
              onClick={handleSendOtpInternal}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <button
              style={styles.primaryBtn}
              onClick={handleResetPasswordInternal}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Confirm Reset"}
            </button>
          )}
        </div>
      )}

      {/* Delete Account Modal */}
      {renderModal(
        "Final Warning",
        showDeleteAccount,
        () => setShowDeleteAccount(false),
        <div style={styles.form}>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "10px" }}>
            To confirm deletion, please enter your password.
          </p>
          <input
            type="password"
            placeholder="Enter Password"
            style={styles.input}
            value={deletePass}
            onChange={(e) => setDeletePass(e.target.value)}
          />
          <button
            style={{ ...styles.primaryBtn, background: "#ef4444" }}
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Deletion"}
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "10px",
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "30px",
  },
  mainTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1f2937",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "16px",
    marginTop: "5px",
  },
  sectionGrid: (isMobile) => ({
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
  }),
  glassCard: {
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  dangerCard: {
    background: "rgba(255, 241, 242, 0.5)",
    border: "1px solid rgba(254, 202, 202, 0.5)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  icon: {
    fontSize: "24px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  cardDesc: {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: 0,
  },
  buttonStack: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  actionBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "14px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
  ghostBtn: {
    background: "transparent",
    border: "none",
    color: "#4b5563",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(4px)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  modalContent: {
    background: "#fff",
    borderRadius: "28px",
    width: "100%",
    maxWidth: "400px",
    padding: "30px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
  },
  modalTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: "20px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  primaryBtn: {
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "5px",
  },
  cancelBtn: {
    width: "100%",
    background: "transparent",
    border: "none",
    color: "#6b7280",
    marginTop: "15px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  modalActions: {
    marginTop: "5px",
  }
};

export default SettingsPage;