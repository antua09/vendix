import { useState, useEffect, useRef } from "react";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../App";

function fdate(ts) {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function Avatar({ name, photo, size = 28 }) {
  const COLORS = [["#E1F5EE","#0F6E56"],["#E6F1FB","#185FA5"],["#FAEEDA","#854F0B"],["#FAECE7","#993C1D"],["#EEEDFE","#3C3489"]];
  const ci = (name?.charCodeAt(0) || 0) % COLORS.length;
  if (photo) return <img src={photo} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: COLORS[ci][0], display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 600, color: COLORS[ci][1], flexShrink: 0 }}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    const q = query(collection(db, "chat"), orderBy("createdAt", "asc"));
    return onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, "chat"), {
        text: text.trim(),
        senderId: user.uid,
        senderName: user.displayName,
        senderPhoto: user.photoURL || null,
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (err) { console.error(err); }
    setSending(false);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(e);
    }
  }

  // Group messages by sender consecutively
  const grouped = messages.reduce((acc, msg, i) => {
    const prev = messages[i - 1];
    const isMe = msg.senderId === user.uid;
    const sameSender = prev?.senderId === msg.senderId;
    acc.push({ ...msg, isMe, showAvatar: !sameSender || !prev });
    return acc;
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", maxWidth: 600 }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 2 }}>Chat del equipo</h1>
        <p style={{ fontSize: 13, color: "var(--text3)" }}>Mensajes en tiempo real</p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2, paddingBottom: 8 }}>
        {grouped.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text3)", fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            <div>Sé el primero en escribir</div>
          </div>
        )}

        {grouped.map((msg, i) => {
          const next = grouped[i + 1];
          const isLastInGroup = !next || next.senderId !== msg.senderId;

          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: msg.isMe ? "row-reverse" : "row", gap: 8, alignItems: "flex-end", marginTop: msg.showAvatar ? 8 : 0 }}>
              {/* Avatar */}
              {!msg.isMe && (
                <div style={{ width: 28, flexShrink: 0 }}>
                  {isLastInGroup && <Avatar name={msg.senderName} photo={msg.senderPhoto} size={28} />}
                </div>
              )}

              <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: msg.isMe ? "flex-end" : "flex-start" }}>
                {msg.showAvatar && !msg.isMe && (
                  <span style={{ fontSize: 11, color: "var(--text3)", marginBottom: 3, marginLeft: 4 }}>{msg.senderName}</span>
                )}
                <div style={{
                  background: msg.isMe ? "var(--teal)" : "var(--surface)",
                  color: msg.isMe ? "#fff" : "var(--text)",
                  border: msg.isMe ? "none" : "1px solid var(--border)",
                  borderRadius: msg.isMe
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                  padding: "8px 12px",
                  fontSize: 14,
                  lineHeight: 1.4,
                  wordBreak: "break-word",
                }}>
                  {msg.text}
                </div>
                {isLastInGroup && (
                  <span style={{ fontSize: 10, color: "var(--text3)", marginTop: 3, marginLeft: msg.isMe ? 0 : 4, marginRight: msg.isMe ? 4 : 0 }}>
                    {fdate(msg.createdAt)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          style={{ flex: 1, fontSize: 14, borderRadius: 24, padding: "10px 16px" }}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          style={{ width: 44, height: 44, borderRadius: "50%", background: text.trim() ? "var(--teal)" : "var(--border2)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  );
}