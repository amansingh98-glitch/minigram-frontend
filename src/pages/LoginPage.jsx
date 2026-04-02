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

      setMessage(data.message);
      setIsError(!data.token);

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);
        onLoginSuccess();
      }
    } catch (error) {
      console.error(error);
      setMessage("Login failed");
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
      setMessage(result);
      setIsError(false);
      setOtpSent(true);
    } catch (error) {
      console.error(error);
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

      setMessage(result);
      setIsError(false);
      setForgotMode(false);
      setOtpSent(false);
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Failed to reset password");
      setIsError(true);
    }
  };

  if (forgotMode) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.brand}>
            <h1 style={styles.title}>MiniGram</h1>
            <p style={styles.subtitle}>Reset your password</p>
          </div>

          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder="Enter your email"
              style={styles.input}
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
          </div>

          {otpSent && (
            <>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  style={styles.input}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <div style={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="Enter new password"
                  style={styles.input}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </>
          )}

          {!otpSent ? (
            <button style={styles.button} onClick={handleSendOtp}>
              Send OTP
            </button>
          ) : (
            <button style={styles.button} onClick={handleResetPassword}>
              Reset Password
            </button>
          )}

          {message && (
            <div style={isError ? styles.messageError : styles.messageSuccess}>
              {message}
            </div>
          )}

          <p
            style={styles.switchText}
            onClick={() => {
              setForgotMode(false);
              setOtpSent(false);
              setMessage("");
              setForgotEmail("");
              setOtp("");
              setNewPassword("");
            }}
          >
            Back to Login
          </p>
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

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    padding: "35px 30px",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(37, 99, 235, 0.10)",
    border: "1px solid #e5e7eb",
  },

  brand: {
    textAlign: "center",
    marginBottom: "28px",
  },

  title: {
    fontSize: "48px",
    fontWeight: "800",
    margin: "0 0 8px 0",
    color: "#111827",
    letterSpacing: "-1px",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "16px",
  },

  inputGroup: {
    marginBottom: "16px",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "14px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    background: "#f9fafb",
  },

  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "white",
    fontSize: "17px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.20)",
  },

  messageSuccess: {
    marginTop: "18px",
    padding: "12px",
    borderRadius: "12px",
    background: "#ecfdf5",
    color: "#047857",
    fontWeight: "600",
    textAlign: "center",
    border: "1px solid #a7f3d0",
  },

  messageError: {
    marginTop: "18px",
    padding: "12px",
    borderRadius: "12px",
    background: "#fef2f2",
    color: "#dc2626",
    fontWeight: "600",
    textAlign: "center",
    border: "1px solid #fecaca",
  },

  switchText: {
    marginTop: "18px",
    textAlign: "center",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
};

export default LoginPage;