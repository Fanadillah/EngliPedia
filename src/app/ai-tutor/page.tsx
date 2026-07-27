"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Sparkles, Bot, User, RefreshCw, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const TOPICS = [
  { id: "daily", label: "Daily Conversation", emoji: "💬" },
  { id: "travel", label: "Travel & Airport", emoji: "✈️" },
  { id: "food", label: "Restaurant & Food", emoji: "🍔" },
  { id: "shopping", label: "Shopping", emoji: "🛒" },
  { id: "work", label: "Work & Business", emoji: "💼" },
  { id: "interview", label: "Job Interview", emoji: "📋" },
];

const LEVELS = [
  { id: "beginner", label: "Pemula", desc: "Kalimat sederhana" },
  { id: "intermediate", label: "Menengah", desc: "Percakapan biasa" },
  { id: "advanced", label: "Mahir", desc: "Percakapan fluent" },
];

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your English tutor. Let's practice conversation! Choose a topic and level below, then start chatting 💬",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("daily");
  const [selectedLevel, setSelectedLevel] = useState("intermediate");
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            topic: selectedTopic,
            level: selectedLevel,
          },
        }),
      });

      const data = await response.json();

      if (data.reply) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again! 🙈",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Hi! Let's practice again! Choose a topic and start chatting 💬",
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold">AI Tutor</h1>
              <p className="text-xs text-muted-foreground">Chat untuk belajar bahasa Inggris</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetChat}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Topic Pills */}
        <div className="max-w-2xl mx-auto px-4 pb-3 overflow-x-auto flex gap-2 no-scrollbar">
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedTopic === topic.id
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {topic.emoji} {topic.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border bg-card/50 overflow-hidden"
          >
            <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Level:</p>
                <div className="flex gap-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedLevel(level.id)}
                      className={`flex-1 px-3 py-2 rounded-xl text-sm transition-all ${
                        selectedLevel === level.id
                          ? "bg-primary text-white"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  message.role === "user"
                    ? "bg-primary"
                    : "bg-gradient-to-br from-primary to-secondary"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-card border border-border"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    message.role === "user" ? "text-white/60" : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2 bg-card border border-border rounded-2xl p-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ketik pesan..."
              className="flex-1 bg-transparent resize-none max-h-32 min-h-[44px] px-3 py-2 text-sm outline-none"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            AI bisa membuat kesalahan. Verifikasi informasi penting.
          </p>
        </div>
      </div>
    </div>
  );
}
