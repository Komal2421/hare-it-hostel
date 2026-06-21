import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { toast } from "../toast";
import { Icon } from "./icons";
import { Avatar } from "./ui";

export default function MessagesDrawer({ conversations, initialConvId, onClose, onChanged }) {
  const [activeId, setActiveId] = useState(initialConvId || null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const openThread = async (id) => {
    setActiveId(id);
    setThread(null);
    try {
      const t = await api.getThread(id);
      setThread(t);
      onChanged(); // unread cleared
    } catch (e) {
      toast(e.message, "error");
    }
  };

  useEffect(() => {
    if (initialConvId) openThread(initialConvId);
    // eslint-disable-next-line
  }, [initialConvId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [thread]);

  const send = async () => {
    const body = text.trim();
    if (!body || !activeId) return;
    setSending(true);
    try {
      const msg = await api.sendMessage(activeId, body);
      setThread((t) => ({ ...t, messages: [...t.messages, msg] }));
      setText("");
      onChanged();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        {activeId && thread ? (
          <>
            <div className="drawer-head">
              <button className="drawer-back" onClick={() => { setActiveId(null); setThread(null); }}>
                <Icon name="chevronLeft" size={18} sw={2} />
              </button>
              <Avatar name={thread.other.name} av={thread.other.av} size={34} verified={thread.other.verified} />
              <h3 style={{ fontSize: 16 }}>{thread.other.name}</h3>
              <button className="drawer-close" onClick={onClose}>
                <Icon name="close" size={18} sw={2.2} />
              </button>
            </div>
            <div className="thread">
              {thread.messages.length === 0 && (
                <div className="pop-empty">Say hello 👋</div>
              )}
              {thread.messages.map((m) => (
                <div className={`msg ${m.mine ? "mine" : "theirs"}`} key={m.id}>
                  {m.body}
                  <span className="msg-time">{m.time}</span>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="composer">
              <input
                placeholder="Write a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button onClick={send} disabled={sending} title="Send">
                <Icon name="send" size={18} sw={2} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="drawer-head">
              <h3>Messages</h3>
              <button className="drawer-close" onClick={onClose}>
                <Icon name="close" size={18} sw={2.2} />
              </button>
            </div>
            <div className="conv-list">
              {conversations.length === 0 ? (
                <div className="pop-empty">
                  No conversations yet. Open a listing and tap the message button to start one.
                </div>
              ) : (
                conversations.map((c) => (
                  <div className="conv-item" key={c.id} onClick={() => openThread(c.id)}>
                    <Avatar name={c.other.name} av={c.other.av} size={42} verified={c.other.verified} />
                    <div className="conv-main">
                      <div className="conv-name">
                        <span>{c.other.name}</span>
                        <span className="conv-time">{c.time}</span>
                      </div>
                      <div className="conv-last">{c.last || "New conversation"}</div>
                    </div>
                    {c.unread > 0 && <span className="conv-unread">{c.unread}</span>}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
