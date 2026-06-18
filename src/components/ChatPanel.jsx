import { useRef, useEffect } from "react";

export default function ChatPanel({ messages, customerName }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-msg ${msg.type}`}>
            {msg.type === "customer" || msg.type === "customer_question" ? (
              <div className="msg-bubble customer-bubble">
                <div className="msg-sender">👤 {msg.sender || customerName}</div>
                <div className="msg-text">{msg.text}</div>
                <div className="msg-time">{msg.time}</div>
              </div>
            ) : msg.type === "agent" ? (
              <div className="msg-bubble agent-bubble">
                <div className="msg-sender">🎧 Agent</div>
                <div className="msg-text">{msg.text}</div>
                <div className="msg-time">{msg.time}</div>
              </div>
            ) : (
              <div className="msg-system">{msg.text}</div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
