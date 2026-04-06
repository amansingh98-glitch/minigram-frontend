import React, { useEffect, useState } from "react";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import { getConversations } from "../services/chatService";

const ChatPage = ({ initialSelectedUser = null }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(initialSelectedUser);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      const safeData = Array.isArray(data) ? data : [];
      setConversations(safeData);

      if (initialSelectedUser) {
        setSelectedUser(initialSelectedUser);
      } else if (!selectedUser && safeData.length > 0) {
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
    <div className="chat-layout">
      <ChatList
        conversations={conversations}
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
      />

      <ChatWindow
        selectedUser={selectedUser}
        onMessageSent={loadConversations}
      />
    </div>
  );
};

export default ChatPage;