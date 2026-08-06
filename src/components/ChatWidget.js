import React from "react";

const { useState, useRef, useEffect } = React;

// ponytail: n8n cevap alanı varsayımı (output/reply/text/message) — workflow'un
// gerçek alan adına göre güncelle.
function extractReply(data) {
  if (!data || typeof data !== "object") return "Bir cevap alınamadı.";
  return data.output || data.reply || data.text || data.message || "Bir cevap alınamadı.";
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  async function handleSend(event) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: trimmed }),
      });
      const data = await response.json().catch(() => ({}));
      const replyText = response.ok ? extractReply(data) : "Bir hata oluştu, lütfen tekrar deneyin.";
      setMessages((current) => [...current, { role: "bot", text: replyText }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: "bot", text: "Bir hata oluştu, lütfen tekrar deneyin." },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  if (!isOpen) {
    return React.createElement(
      "button",
      {
        className: "chat-widget-button",
        onClick: () => setIsOpen(true),
        "aria-label": "Sohbeti aç",
      },
      "💬"
    );
  }

  return React.createElement(
    "div",
    { className: "chat-widget-panel" },
    React.createElement(
      "div",
      { className: "chat-widget-header" },
      React.createElement("span", null, "Bize Sorun"),
      React.createElement(
        "button",
        {
          type: "button",
          className: "chat-widget-close",
          onClick: () => setIsOpen(false),
          "aria-label": "Sohbeti kapat",
        },
        "✕"
      )
    ),
    React.createElement(
      "div",
      { className: "chat-widget-messages", ref: messagesRef },
      messages.length === 0 &&
        React.createElement(
          "p",
          { className: "chat-message chat-message--bot" },
          "Merhaba! Bir sorunuz mu var?"
        ),
      messages.map((message, index) =>
        React.createElement(
          "p",
          { key: index, className: `chat-message chat-message--${message.role}` },
          message.text
        )
      ),
      isTyping &&
        React.createElement(
          "p",
          { className: "chat-message chat-message--bot chat-message--typing" },
          "Yazıyor…"
        )
    ),
    React.createElement(
      "form",
      { className: "chat-widget-input-row", onSubmit: handleSend },
      React.createElement("input", {
        className: "chat-widget-input",
        type: "text",
        placeholder: "Mesajınızı yazın…",
        value: input,
        onChange: (event) => setInput(event.target.value),
        disabled: isTyping,
      }),
      React.createElement(
        "button",
        {
          type: "submit",
          className: "chat-widget-send",
          disabled: isTyping || !input.trim(),
        },
        "Gönder"
      )
    )
  );
}
