import { useState } from "react";
import AuthCard from "../components/AuthCard";
import {
  loginUser,
  resetPasswordWithOtp,
  sendForgotPasswordOtp,
} from "../services/authService";

function LoginPage({ onSwitchToRegister, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [forgotMode, setForgotMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Please fill all fields");
      setIsError(true);
      return;
    }

    try {
      const data = await loginUser({ email, password });

      if (data?.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);

        if (data.username) {
          localStorage.setItem("username", data.username);
        }

        if (data.profileImageUrl) {
          localStorage.setItem("profileImageUrl", data.profileImageUrl);
        }

        setMessage(data.message || "Login successful");
        setIsError(false);

        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setMessage(data?.message || "Login failed");
        setIsError(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.message || "Login failed");
      setIsError(true);
    }
  };

  const handleSendOtp = async () => {
    if (!forgotEmail) {
      setMessage("Please enter your email");
      setIsError(true);
      return;
    }

    try {
      const result = await sendForgotPasswordOtp(forgotEmail);
      setMessage(result || "OTP sent successfully");
      setIsError(false);
      setOtpSent(true);
    } catch (error) {
      console.error("Send OTP error:", error);
      setMessage(error.message || "Failed to send OTP");
      setIsError(true);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotEmail || !otp || !newPassword) {
      setMessage("Please fill all fields");
      setIsError(true);
      return;
    }

    try {
      const result = await resetPasswordWithOtp({
        email: forgotEmail,
        otp,
        newPassword,
      });

      setMessage(result || "Password reset successful");
      setIsError(false);
      setForgotMode(false);
      setOtpSent(false);
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage(error.message || "Failed to reset password");
      setIsError(true);
    }
  };

  if (forgotMode) {
    return (
      <div style={styles.container}>
        <div style={styles.glassCard}>
          <div style={styles.brand}>
            <h1 style={styles.title}>MiniGram</h1>
            <p style={styles.subtitle}>Account Recovery</p>
          </div>

          <div style={styles.formContent}>
            <div style={styles.inputWrapper}>
              <input
                type="email"
                placeholder="Confirmation Email"
                style={styles.premiumInput}
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>

            {otpSent && (
              <div style={styles.otpSection}>
                <div style={styles.inputWrapper}>
                  <input
                    type="text"
                    placeholder="Enter 6-Digit OTP"
                    style={styles.premiumInput}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                <div style={styles.inputWrapper}>
                  <input
                    type="password"
                    placeholder="New Secure Password"
                    style={styles.premiumInput}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {!otpSent ? (
              <button style={styles.premiumButton} onClick={handleSendOtp}>
                Send Verification OTP
              </button>
            ) : (
              <button style={styles.premiumButton} onClick={handleResetPassword}>
                Update Password
              </button>
            )}

            {message && (
              <div style={isError ? styles.toastError : styles.toastSuccess}>
                {message}
              </div>
            )}

            <p
              style={styles.backLink}
              onClick={() => {
                setForgotMode(false);
                setOtpSent(false);
                setMessage("");
                setForgotEmail("");
                setOtp("");
                setNewPassword("");
                setIsError(false);
              }}
            >
              ← Back to login
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthCard
      isLoginMode={true}
      username=""
      setUsername={() => {}}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      message={message}
      isError={isError}
      onSubmit={handleLogin}
      onSwitchMode={onSwitchToRegister}
      onForgotPassword={() => {
        setForgotMode(true);
        setMessage("");
        setIsError(false);
      }}
    />
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #f5f7ff 0%, #eef2ff 45%, #f8fafc 100%)",
    padding: "20px",
  },
  glassCard: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    padding: "40px 35px",
    borderRadius: "28px",
    boxShadow: "0 25px 60px rgba(37, 99, 235, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  formContent: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputWrapper: {
    width: "100%",
  },
  premiumInput: {
    width: "100%",
    padding: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    background: "#f9fafb",
    transition: "all 0.2s ease",
  },
  otpSection: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  premiumButton: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "white",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    margin: "10px 0",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.25)",
    transition: "transform 0.2s ease",
  },
  toastSuccess: {
    padding: "14px",
    borderRadius: "14px",
    background: "#f0fdf4",
    color: "#166534",
    fontWeight: "600",
    fontSize: "14px",
    textAlign: "center",
    border: "1px solid #bbf7d0",
  },
  toastError: {
    padding: "14px",
    borderRadius: "14px",
    background: "#fef2f2",
    color: "#991b1b",
    fontWeight: "600",
    fontSize: "14px",
    textAlign: "center",
    border: "1px solid #fecaca",
  },
  backLink: {
    textAlign: "center",
    color: "#6b7280",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    marginTop: "10px",
    transition: "color 0.2s ease",
  }
};

export default LoginPage;