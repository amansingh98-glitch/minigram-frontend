import React from "react";

const ChatList = ({ conversations = [], selectedUser, onSelectUser }) => {
  return (
    <div className="chat-list-card">
      <div className="chat-list-header">Messages</div>

      <div className="chat-list-body">
        {conversations.length === 0 ? (
          <div style={{ color: "#6b7280" }}>No conversations yet</div>
        ) : (
          conversations.map((user) => (
            <div
              key={user.userId}
              className={`chat-user-item ${
                selectedUser?.userId === user.userId ? "active" : ""
              }`}
              onClick={() => onSelectUser(user)}
            >
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.username}
                  className="chat-user-avatar"
                />
              ) : (
                <div className="chat-user-avatar initial-avatar">
                  {user.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}

              <div style={{ minWidth: 0 }}>
                <div className="chat-user-title">{user.username}</div>
                <div className="chat-user-last">{user.lastMessage}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;