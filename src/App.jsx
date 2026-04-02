import React, { useState } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const App = () => {
  const token = localStorage.getItem("token");
  const [currentPage, setCurrentPage] = useState(token ? "home" : "login");

  const handleLoginSuccess = () => {
    setCurrentPage("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    localStorage.removeItem("userName");
    localStorage.removeItem("name");
    localStorage.removeItem("profileImageUrl");
    setCurrentPage("login");
  };

  if (!token && currentPage === "register") {
    return <RegisterPage goToLogin={() => setCurrentPage("login")} />;
  }

  if (!token) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setCurrentPage("register")}
      />
    );
  }

  return <HomePage onLogout={handleLogout} />;
};

export default App;