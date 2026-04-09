import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  connectChatSocket,
  deleteMessageForEveryone,
  deleteMessageForMe,
  deleteConversation,
  getMessages,
  sendFileMessage,
  sendMessage,
  sendTypingStatus,
  reactToMessage,
} from "../services/chatService";
import { getMyProfile } from "../services/userService";
import { API_BASE_URL } from "../config";

const ChatWindow = ({ selectedUser, onMessageSent, isMobile, onBackClick }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [typingText, setTypingText] = useState("");
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [menuMessageId, setMenuMessageId] = useState(null);
  const [replyToMessage, setReplyToMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const selectedUserId = selectedUser?.userId;

  const userInitial = useMemo(() => {
    return selectedUser?.username ? selectedUser.username.charAt(0).toUpperCase() : "U";
  }, [selectedUser]);

  const loadCurrentUser = async () => {
    try {
      const me = await getMyProfile();
      setCurrentUserId(me.id);
    } catch (error) {
      console.error(error);
    }
  };

  const loadMessages = async () => {
    if (!selectedUserId) return;
    try {
      setLoading(true);
      const data = await getMessages(selectedUserId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsSeen = async () => {
    if (!selectedUserId) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/chat/seen/${selectedUserId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { loadCurrentUser(); }, []);

  useEffect(() => {
    setMessages([]);
    setMessageText("");
    setTypingText("");
    setMenuMessageId(null);
    setReplyToMessage(null);
    setIsOtherUserOnline(!!selectedUser?.online);
    if (selectedUserId) { loadMessages(); markMessagesAsSeen(); }
  }, [selectedUserId, selectedUser]);

  useEffect(() => {
    let isMounted = true;
    if (!currentUserId || !selectedUserId) return;
    connectChatSocket({
      currentUserId,
      selectedUserId,
      onMessageReceived: () => { if (isMounted) loadMessages(); },
      onConversationRefresh: () => { if (isMounted) { if (onMessageSent) onMessageSent(); loadMessages(); } },
      onTypingReceived: (payload) => { if (isMounted) setTypingText(payload.typing ? `${payload.senderName} is typing...` : ""); },
      onOnlineStatus: (payload) => { if (isMounted && payload.userId === selectedUserId) setIsOtherUserOnline(payload.online); },
    });
    return () => { isMounted = false; };
  }, [currentUserId, selectedUserId, onMessageSent]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typingText]);

  const handleSendMessage = async () => {
    if (!selectedUserId || !messageText.trim()) return;
    try {
      setSending(true);
      await sendMessage(selectedUserId, messageText.trim(), replyToMessage?.id);
      setMessageText("");
      setReplyToMessage(null);
      await sendTypingStatus(selectedUserId, false);
      if (onMessageSent) await onMessageSent();
      await loadMessages();
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedUserId || !window.confirm("Are you sure you want to delete this entire chat?")) return;
    try {
      await deleteConversation(selectedUserId);
      if (onBackClick) onBackClick();
      if (onMessageSent) await onMessageSent();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteForMe = async (msgId) => {
    try {
      await deleteMessageForMe(msgId);
      setMenuMessageId(null);
      await loadMessages();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteForEveryone = async (msgId) => {
    try {
      await deleteMessageForEveryone(msgId);
      setMenuMessageId(null);
      await loadMessages();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReact = async (messageId, reaction) => {
    try {
      await reactToMessage(messageId, reaction);
      setMenuMessageId(null);
      await loadMessages();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUserId) return;
    try {
      setSending(true);
      await sendFileMessage(selectedUserId, file);
      if (onMessageSent) await onMessageSent();
      await loadMessages();
    } catch (error) {
      alert(error.message);
    } finally {
      setSending(false);
    }
  };

  const handleTypingChange = async (val) => {
    setMessageText(val);
    if (!selectedUserId) return;
    try {
      await sendTypingStatus(selectedUserId, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(async () => {
        try { await sendTypingStatus(selectedUserId, false); } catch (e) {}
      }, 1000);
    } catch (e) {}
  };

  const renderMessageBody = (m) => {
    if (m.messageType === "IMAGE" && m.fileUrl) return <img src={m.fileUrl} alt="chat" style={styles.imgPreview} />;
    if (m.messageType === "FILE" && m.fileUrl) return (
      <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{ color: m.currentUserMessage ? "#fff" : "#2563eb", fontWeight: "700" }}>
        📎 {m.fileName || "Download"}
      </a>
    );
    return <div style={{ fontSize: "14px", lineHeight: "1.4" }}>{m.messageText}</div>;
  };

  const TypingIndicator = () => (
    <div style={styles.typingArea}>
      <div style={styles.typingBubble}>
        <div style={styles.dot}></div>
        <div style={{ ...styles.dot, animationDelay: "0.2s" }}></div>
        <div style={{ ...styles.dot, animationDelay: "0.4s" }}></div>
      </div>
      <span style={styles.typingText}>{typingText}</span>
    </div>
  );

  if (!selectedUser) {
    return (
      <div style={styles.emptyWrap}>
        <div style={styles.emptyIcon}>✉️</div>
        <h2 style={styles.emptyTitle}>Your Messages</h2>
        <p style={styles.emptyText}>Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div style={styles.chatWindow}>
      <style>{chatAnimations}</style>
      {/* Header */}
      <header style={styles.chatHeader}>
        <div style={styles.headerLeft}>
          {isMobile && <button style={styles.backBtn} onClick={onBackClick}>←</button>}
          {selectedUser.profileImageUrl ? (
            <img src={selectedUser.profileImageUrl} style={styles.headerAvatar} alt="user" />
          ) : (
            <div style={styles.headerInitial}>{userInitial}</div>
          )}
          <div>
            <div style={styles.headerName}>{selectedUser.username}</div>
            <div style={styles.headerStatus}>
              {typingText ? <span style={styles.typing}>{typingText}</span> :
               isOtherUserOnline ? <><span style={styles.onlineDot} /> Online</> : "Offline"}
            </div>
          </div>
        </div>
        <div style={styles.headerRight}>
           <button style={styles.headerActionBtn} onClick={handleDeleteChat} title="Delete Chat">🗑️</button>
        </div>
      </header>

      {/* Messages */}
      <div style={styles.messageArea}>
        {messages.map((m, idx) => (
          <div key={m.id || idx} style={styles.msgRow(m.currentUserMessage)}>
            <div style={styles.bubbleWrap}>
              <div
                style={styles.bubble(m.currentUserMessage)}
                onClick={(e) => { e.stopPropagation(); setMenuMessageId(menuMessageId === m.id ? null : m.id); }}
              >
                {m.replyToMessageText && (
                  <div style={styles.replyBubble}>
                    <div style={styles.replyText}>{m.replyToMessageText}</div>
                  </div>
                )}
                {renderMessageBody(m)}
                {m.reaction && <div style={styles.reactionBadge}>{m.reaction}</div>}
              </div>
              <div style={styles.msgTime(m.currentUserMessage)}>
                {m.createdAt?.replace("T", " ").slice(11, 16)} {m.currentUserMessage && (m.status === "SEEN" ? "✔✔" : "✔")}
              </div>

              {menuMessageId === m.id && (
                <div style={styles.msgMenu(m.currentUserMessage)} onClick={e => e.stopPropagation()}>
                  <button style={styles.menuBtn} onClick={() => { setReplyToMessage(m); setMenuMessageId(null); }}>Reply</button>
                  <button style={styles.menuBtn} onClick={() => handleDeleteForMe(m.id)}>Delete for Me</button>
                  {m.currentUserMessage && (
                    <button style={{...styles.menuBtn, color: '#ef4444'}} onClick={() => handleDeleteForEveryone(m.id)}>Delete for Everyone</button>
                  )}
                  <div style={styles.reactionRow}>
                    {['❤️', '👍', '😂', '🔥'].map(e => (
                      <span key={e} style={styles.reactionIcon} onClick={() => handleReact(m.id, e)}>{e}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {typingText && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <footer style={styles.chatFooter}>
        {replyToMessage && (
          <div style={styles.replyPreview}>
            <div style={styles.replyPreviewBody}>Replying to: {replyToMessage.messageText || "Attachment"}</div>
            <span style={styles.replyClose} onClick={() => setReplyToMessage(null)}>&times;</span>
          </div>
        )}
        <div style={styles.inputRow}>
          <button style={styles.attachBtn} onClick={() => fileInputRef.current.click()}>📎</button>
          <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileSelect} />
          <input
            style={styles.chatInput}
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => handleTypingChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button style={styles.sendBtn} onClick={handleSendMessage} disabled={sending}>
            {sending && !messageText.trim() ? "..." : "Send"}
          </button>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  chatWindow: { flex: 1, display: "flex", flexDirection: "column", height: "100%", background: "rgba(255,255,255,0.4)", backdropFilter: "blur(24px)", borderRadius: "32px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" },
  chatHeader: { padding: "16px 24px", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  headerAvatar: { width: "42px", height: "42px", borderRadius: "14px", objectFit: "cover" },
  headerInitial: { width: "42px", height: "42px", borderRadius: "14px", background: "linear-gradient(135deg, #2563eb, #4f46e5)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "18px" },
  headerName: { fontWeight: "800", color: "#111827", fontSize: "16px", letterSpacing: "-0.3px" },
  headerStatus: { fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px", fontWeight: "500" },
  headerRight: { display: "flex", alignItems: "center", gap: "12px" },
  headerActionBtn: { background: "none", border: "none", fontSize: "18px", cursor: "pointer", opacity: 0.6, transition: "opacity 0.2s ease" },
  onlineDot: { width: "8px", height: "8px", background: "#10b981", borderRadius: "50%", boxShadow: "0 0 10px rgba(16,185,129,0.5)" },
  typing: { color: "#2563eb", fontWeight: "700", animation: "pulse 1.5s infinite" },
  backBtn: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", marginRight: "8px" },
  messageArea: { flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", scrollbarWidth: "none" },
  msgRow: (mine) => ({ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", animation: "msgIn 0.3s ease-out forwards" }),
  bubbleWrap: { position: "relative", maxWidth: "80%" },
  bubble: (mine) => ({
    padding: "12px 16px", borderRadius: "20px", borderBottomRightRadius: mine ? "4px" : "20px", borderBottomLeftRadius: mine ? "20px" : "4px",
    background: mine ? "linear-gradient(135deg, #2563eb, #7c3aed)" : "#fff",
    color: mine ? "#fff" : "#1e293b", fontSize: "15px", position: "relative", 
    boxShadow: mine ? "0 8px 20px rgba(37, 99, 235, 0.15)" : "0 2px 8px rgba(0,0,0,0.04)",
    border: mine ? "none" : "1px solid #f1f5f9",
    transition: "transform 0.2s ease"
  }),
  msgTime: (mine) => ({ fontSize: "10px", marginTop: "4px", textAlign: mine ? "right" : "left", color: "#94a3b8", fontWeight: "600" }),
  imgPreview: { maxWidth: "100%", borderRadius: "16px", marginTop: "4px", display: "block" },
  chatFooter: { padding: "16px 20px", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(0,0,0,0.05)" },
  inputRow: { display: "flex", gap: "10px", alignItems: "center" },
  chatInput: { flex: 1, border: "1px solid #e2e8f0", borderRadius: "16px", padding: "12px 18px", fontSize: "14px", outline: "none", background: "#fff", transition: "all 0.3s ease" },
  attachBtn: { border: "none", background: "#f1f5f9", width: "42px", height: "42px", borderRadius: "14px", fontSize: "18px", cursor: "pointer", transition: "all 0.2s ease" },
  sendBtn: { border: "none", background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#fff", padding: "0 20px", height: "42px", borderRadius: "14px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.2)" },
  typingArea: { display: "flex", alignItems: "center", gap: "10px", margin: "4px 0" },
  typingBubble: { background: "#f1f5f9", padding: "10px 14px", borderRadius: "18px", display: "flex", gap: "4px" },
  dot: { width: "6px", height: "6px", background: "#94a3b8", borderRadius: "50%", animation: "typingDot 1.4s infinite ease-in-out" },
  typingText: { fontSize: "12px", color: "#94a3b8", fontWeight: "500" },
  emptyWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.5)", borderRadius: "32px", padding: "40px" },
  emptyIcon: { fontSize: "60px", marginBottom: "20px" },
  emptyTitle: { fontSize: "24px", fontWeight: "800", color: "#111827", marginBottom: "8px" },
  emptyText: { color: "#6b7280" },
  reactionBadge: { position: "absolute", bottom: "-8px", right: "-4px", background: "#fff", borderRadius: "20px", padding: "2px 6px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", fontSize: "12px", border: "1px solid #f1f5f9" },
  msgMenu: (mine) => ({ position: "absolute", bottom: "100%", right: mine ? 0 : "auto", left: mine ? "auto" : 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", boxShadow: "0 15px 40px rgba(0,0,0,0.12)", borderRadius: "16px", padding: "8px", zIndex: 10, marginBottom: "8px", border: "1px solid rgba(255,255,255,0.5)" }),
  menuBtn: { width: "100%", textAlign: "left", padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer", fontSize: "13px", fontWeight: "700", color: "#475569" },
  reactionRow: { display: "flex", gap: "6px", padding: "6px", borderTop: "1px solid #f1f5f9" },
  reactionIcon: { cursor: "pointer", fontSize: "18px" },
  replyBubble: { background: "rgba(0,0,0,0.03)", padding: "8px 10px", borderRadius: "12px", marginBottom: "6px", fontSize: "12px", borderLeft: "3px solid #2563eb", color: "inherit", opacity: 0.8 },
  replyText: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  replyPreview: { background: "#f1f5f9", padding: "10px 14px", borderRadius: "12px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid #2563eb" },
  replyPreviewBody: { fontSize: "12px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  replyClose: { cursor: "pointer", fontSize: "18px", color: "#94a3b8" }
};

const chatAnimations = `
@keyframes msgIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes typingDot {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
`;

export default ChatWindow;