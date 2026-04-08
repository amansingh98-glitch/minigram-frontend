import React, { useEffect, useState } from "react";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import { getConversations } from "../services/chatService";

const ChatPage = ({ initialSelectedUser = null }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(initialSelectedUser);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      const safeData = Array.isArray(data) ? data : [];
      setConversations(safeData);

      if (initialSelectedUser) {
        setSelectedUser(initialSelectedUser);
      } else if (!isMobile && !selectedUser && safeData.length > 0) {
        setSelectedUser(safeData[0]);
      }
    } catch (error) {
      console.error("Conversation load error:", error);
      setConversations([]);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (initialSelectedUser) {
      setSelectedUser(initialSelectedUser);
    }
  }, [initialSelectedUser]);

  return (
    <div 
      className="chat-layout" 
      style={{ 
        display: isMobile ? "flex" : "grid",
        gridTemplateColumns: isMobile ? "1fr" : "350px 1fr",
        flexDirection: "column",
        height: isMobile ? "calc(100dvh - 170px)" : "calc(100vh - 120px)",
        gap: isMobile ? "0" : "24px",
      }}
    >
      {(!isMobile || !selectedUser) && (
        <ChatList
          conversations={conversations}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />
      )}

      {(!isMobile || selectedUser) && (
        <ChatWindow
          selectedUser={selectedUser}
          onMessageSent={loadConversations}
          isMobile={isMobile}
          onBackClick={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default ChatPage;