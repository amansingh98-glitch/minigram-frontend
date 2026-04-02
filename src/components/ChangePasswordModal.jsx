import React, { useState } from "react";
import { changePassword } from "../services/userService";

const ChangePasswordModal = ({ onClose }) => {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const handleSubmit = async () => {
    try {
      await changePassword(oldPass, newPass);
      alert("Password changed");
      onClose();
    } catch {
      alert("Error");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <h3>Change Password</h3>

        <input
          type="password"
          placeholder="Old password"
          value={oldPass}
          onChange={(e) => setOldPass(e.target.value)}
        />

        <input
          type="password"
          placeholder="New password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />

        <button onClick={handleSubmit}>Update</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "300px",
  },
};

export default ChangePasswordModal;