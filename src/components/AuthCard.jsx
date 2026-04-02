import { styles } from "../styles/authStyles";

function AuthCard({
  isLoginMode,
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  message,
  isError,
  onSubmit,
  onSwitchMode,
  onForgotPassword,
}) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <h1 style={styles.title}>MiniGram</h1>
          <p style={styles.subtitle}>
            {isLoginMode ? "Login to continue 🚀" : "Create your account 🚀"}
          </p>
        </div>

        {!isLoginMode && (
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Enter username"
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}

        <div style={styles.inputGroup}>
          <input
            type="text"
            placeholder="Enter email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={styles.inputGroup}>
          <input
            type="password"
            placeholder="Enter password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {isLoginMode && (
          <p style={styles.forgotText} onClick={onForgotPassword}>
            Forgot Password?
          </p>
        )}

        <button style={styles.button} onClick={onSubmit}>
          {isLoginMode ? "Login" : "Register"}
        </button>

        {message && (
          <div style={isError ? styles.messageError : styles.messageSuccess}>
            {message}
          </div>
        )}

        <p style={styles.switchText} onClick={onSwitchMode}>
          {isLoginMode
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

export default AuthCard;