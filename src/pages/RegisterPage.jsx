import { useState, useEffect } from "react";
import { registerUser, verifyRegistrationOtp, resendVerificationOtp } from "../services/authService";

function RegisterPage({ goToLogin }) {
  const [stage, setStage] = useState("register"); // "register" or "verify"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setMessage("All fields are mandatory");
      setIsError(true);
      return;
    }
    if (password.length < 4) {
      setMessage("Password must be at least 4 characters");
      setIsError(true);
      return;
    }

    try {
      setLoading(true);
      setMessage("Creating your premium account... 🚀");
      setIsError(false);
      
      const resText = await registerUser({ username, email, password });
      
      // The backend returns 201 Created and a success string
      if (resText.toLowerCase().includes("successful") || resText.toLowerCase().includes("verify")) {
        setMessage("Account created! Please enter the 6-digit OTP sent to your email.");
        setIsError(false);
        setStage("verify");
      } else {
        // This handles cases where backend might return 200 but logic-wise it's a message
        setMessage(resText);
        setIsError(true);
      }
    } catch (error) {
      console.error("Register Error:", error);
      // Detailed error from GlobalExceptionHandler
      const errMsg = error.message || "Registration failed. Check your network or SMTP settings.";
      setMessage(errMsg);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setMessage("Please enter the complete 6-digit code");
      setIsError(true);
      return;
    }

    try {
      setLoading(true);
      const response = await verifyRegistrationOtp(email, otpValue);
      // response is { message: "..." }
      setMessage(response.message || "Verification successful! Redirecting to login...");
      setIsError(false);
      setTimeout(() => goToLogin(), 2000);
    } catch (error) {
      setMessage(error.message || "Invalid or expired OTP");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      const response = await resendVerificationOtp(email);
      const msg = typeof response === "string" ? response : (response.message || "OTP resent!");
      setMessage(msg);
      setIsError(false);
    } catch (error) {
      setMessage(error.message || "Failed to resend OTP");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background blobs for premium feel */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      
      <div style={styles.glassCard}>
        <div style={styles.brand}>
          <h1 style={styles.title}>MiniGram</h1>
          <p style={styles.subtitle}>
            {stage === "register" ? "Join the community 🚀" : "Verify your identity ✉️"}
          </p>
        </div>

        <div style={styles.form}>
          {stage === "register" ? (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Username</label>
                <input
                  type="text"
                  placeholder="Choosing a cool username..."
                  style={styles.input}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  style={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  placeholder="Minimum 4 characters"
                  style={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button style={styles.button} onClick={handleRegister} disabled={loading}>
                {loading && stage === "register" ? "Processing..." : "Create Account"}
              </button>
            </>
            ) : (
              <>
                <div style={styles.otpHeader}>
                  <p style={styles.otpText}>
                    We've sent a 6-digit code to <strong>{email}</strong>.
                  </p>
                </div>
                <div style={styles.otpContainer}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      style={styles.otpInput}
                    />
                  ))}
                </div>
                <button style={styles.button} onClick={handleVerify} disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <div style={styles.resendBox}>
                  <p style={styles.footerText}>
                    Didn't get the code?{" "}
                    <span style={styles.resendBtn} onClick={handleResend}>
                      Resend Code
                    </span>
                  </p>
                </div>
              </>
            )}

          {message && (
            <div style={isError ? styles.errorBox : styles.successBox}>
              {message}
            </div>
          )}

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already have an account?{" "}
              <span style={styles.link} onClick={goToLogin}>
                Login instead
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #f5f7ff 0%, #eef2ff 50%, #f8fafc 100%)",
    padding: "20px",
  },
  glassCard: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    padding: "40px 35px",
    borderRadius: "32px",
    boxShadow: "0 25px 60px rgba(37, 99, 235, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  brand: { textAlign: "center", marginBottom: "32px" },
  title: {
    fontSize: "48px", fontWeight: "900", margin: "0 0 8px 0",
    background: "linear-gradient(135deg, #111827, #2563eb)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    letterSpacing: "-2px",
  },
  subtitle: { margin: 0, color: "#4b5563", fontSize: "17px", fontWeight: "500" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#374151" },
  input: {
    width: "100%", padding: "16px", borderRadius: "16px", border: "1px solid #e5e7eb",
    background: "#ffffff", fontSize: "15px", outline: "none", boxSizing: "border-box"
  },
  button: {
    width: "100%", padding: "16px", borderRadius: "18px", border: "none",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#ffffff",
    fontSize: "16px", fontWeight: "700", cursor: "pointer",
    boxShadow: "0 10px 25px rgba(37, 99, 235, 0.25)",
    transition: "all 0.3s ease",
  },
  otpContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    margin: "10px 0",
  },
  otpInput: {
    width: "50px",
    height: "60px",
    borderRadius: "14px",
    border: "2px solid #e5e7eb",
    background: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "800",
    color: "#1e293b",
    outline: "none",
    transition: "all 0.2s ease",
  },
  blob1: { position: "absolute", width: "300px", height: "300px", background: "rgba(37, 99, 235, 0.1)", borderRadius: "50%", top: "-100px", right: "-100px", filter: "blur(60px)", zIndex: -1 },
  blob2: { position: "absolute", width: "250px", height: "250px", background: "rgba(124, 58, 237, 0.08)", borderRadius: "50%", bottom: "-80px", left: "-80px", filter: "blur(50px)", zIndex: -1 },
  footer: { textAlign: "center", marginTop: "10px" },
  footerText: { fontSize: "14px", color: "#6b7280", margin: 0 },
  link: { color: "#2563eb", fontWeight: "700", cursor: "pointer", marginLeft: "4px" },
  otpHeader: { textAlign: "center", marginBottom: "10px" },
  otpText: { fontSize: "14px", color: "#4b5563", lineHeight: "1.6" },
  resendBox: { textAlign: "center", marginTop: "-10px" },
  resendBtn: { color: "#2563eb", fontWeight: "700", cursor: "pointer", fontSize: "14px" },
  successBox: { padding: "14px", borderRadius: "12px", background: "#f0fdf4", color: "#166534", fontSize: "14px", fontWeight: "600", textAlign: "center", border: "1px solid #bbf7d0" },
  errorBox: { padding: "14px", borderRadius: "12px", background: "#fef2f2", color: "#991b1b", fontSize: "14px", fontWeight: "600", textAlign: "center", border: "1px solid #fecaca" }
};

export default RegisterPage;