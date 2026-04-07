import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  connectChatSocket,
  deleteMessageForEveryone,
  deleteMessageForMe,
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
    return <div>{m.messageText}</div>;
  };

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
                    <small>Replying to:</small>
                    <div style={styles.replyText}>{m.replyToMessageText}</div>
                  </div>
                )}
                {renderMessageBody(m)}
                {m.reaction && <div style={styles.reactionBadge}>{m.reaction}</div>}
                <div style={styles.msgTime(m.currentUserMessage)}>
                  {m.createdAt?.replace("T", " ").slice(11, 16)} {m.currentUserMessage && (m.status === "SEEN" ? "✔✔" : "✔")}
                </div>
              </div>

              {menuMessageId === m.id && (
                <div style={styles.msgMenu(m.currentUserMessage)} onClick={e => e.stopPropagation()}>
                  <button style={styles.menuBtn} onClick={() => { setReplyToMessage(m); setMenuMessageId(null); }}>Reply</button>
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
          <button style={styles.sendBtn} onClick={handleSendMessage} disabled={sending}>Send</button>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  chatWindow: { flex: 1, display: "flex", flexDirection: "column", height: "calc(100vh - 100px)", background: "#fff", borderRadius: "24px", overflow: "hidden", border: "1px solid #f3f4f6" },
  chatHeader: { padding: "16px 24px", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  headerAvatar: { width: "40px", height: "40px", borderRadius: "12px", objectFit: "cover" },
  headerInitial: { width: "40px", height: "40px", borderRadius: "12px", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" },
  headerName: { fontWeight: "700", color: "#111827", fontSize: "16px" },
  headerStatus: { fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "6px" },
  onlineDot: { width: "8px", height: "8px", background: "#10b981", borderRadius: "50%" },
  messageArea: { flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" },
  msgRow: (mine) => ({ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }),
  bubbleWrap: { position: "relative", maxWidth: "75%" },
  bubble: (mine) => ({
    padding: "12px 16px", borderRadius: "18px", borderBottomRightRadius: mine ? "2px" : "18px", borderBottomLeftRadius: mine ? "18px" : "2px",
    background: mine ? "linear-gradient(135deg, #2563eb, #4f46e5)" : "#f3f4f6",
    color: mine ? "#fff" : "#111827", fontSize: "15px", position: "relative", boxShadow: mine ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "none"
  }),
  msgTime: (mine) => ({ fontSize: "10px", marginTop: "4px", textAlign: mine ? "right" : "left", opacity: 0.7 }),
  imgPreview: { maxWidth: "100%", borderRadius: "12px", marginTop: "8px" },
  chatFooter: { padding: "16px 24px", background: "#fff", borderTop: "1px solid #f3f4f6" },
  inputRow: { display: "flex", gap: "12px", alignItems: "center" },
  chatInput: { flex: 1, border: "1px solid #e5e7eb", borderRadius: "12px", padding: "12px 16px", fontSize: "15px", outline: "none", background: "#f9fafb" },
  attachBtn: { border: "none", background: "#f3f4f6", width: "40px", height: "40px", borderRadius: "10px", fontSize: "18px", cursor: "pointer" },
  sendBtn: { border: "none", background: "#2563eb", color: "#fff", padding: "0 20px", height: "40px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },
  emptyWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f9fafb", borderRadius: "24px", padding: "40px" },
  emptyIcon: { fontSize: "60px", marginBottom: "20px" },
  emptyTitle: { fontSize: "24px", fontWeight: "800", color: "#111827", marginBottom: "8px" },
  emptyText: { color: "#6b7280" },
  reactionBadge: { position: "absolute", bottom: "-10px", right: "-10px", background: "#fff", borderRadius: "50%", padding: "2px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", fontSize: "12px" },
  msgMenu: (mine) => ({ position: "absolute", bottom: "100%", right: mine ? 0 : "auto", left: mine ? "auto" : 0, background: "#fff", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", borderRadius: "12px", padding: "8px", zIndex: 10, marginBottom: "8px" }),
  menuBtn: { width: "100%", textAlign: "left", padding: "8px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: "14px" },
  reactionRow: { display: "flex", gap: "8px", padding: "4px 8px" },
  reactionIcon: { cursor: "pointer", fontSize: "18px" },
  replyBubble: { background: "rgba(0,0,0,0.05)", padding: "6px 8px", borderRadius: "8px", marginBottom: "8px", fontSize: "12px", borderLeft: "3px solid #2563eb" },
  replyPreview: { background: "#f9fafb", padding: "8px 12px", borderRadius: "10px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid #2563eb" },
  replyClose: { cursor: "pointer", fontSize: "20px", opacity: 0.5 }
};

export default ChatWindow;