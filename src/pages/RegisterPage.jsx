import { useState } from "react";
import AuthCard from "../components/AuthCard";
import { registerUser } from "../services/authService";

function RegisterPage({ goToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setMessage("Please fill all fields");
      setIsError(true);
      return;
    }

    try {
      const data = await registerUser({ username, email, password });

      setMessage(data);
      setIsError(
        data.toLowerCase().includes("failed") ||
          data.toLowerCase().includes("already")
      );

      if (!data.toLowerCase().includes("already")) {
        setUsername("");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      console.error(error);
      setMessage("Register failed");
      setIsError(true);
    }
  };

  return (
    <AuthCard
      isLoginMode={false}
      username={username}
      setUsername={setUsername}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      message={message}
      isError={isError}
      onSubmit={handleRegister}
      onSwitchMode={goToLogin}
    />
  );
}

export default RegisterPage;