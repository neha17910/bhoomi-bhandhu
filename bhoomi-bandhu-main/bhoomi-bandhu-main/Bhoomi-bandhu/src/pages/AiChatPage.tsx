import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  Brain,
  Send,
  Sprout,
  Trash2,
  Zap,
} from "lucide-react";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  mode?: ChatMode;
}

type ChatMode = "balanced" | "fast" | "deep";

const SUGGESTION_CHIPS = [
  "Black cotton soil crops",
  "PM-KISAN eligibility",
  "PMFBY crop insurance",
  "Wheat storage tips",
];

export function AiChatPage() {
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";
  const { user } = useAuth();
  const { currentLanguage, t } = useLanguage();

  const [mode, setMode] = useState<ChatMode>("fast");
  const [input, setInput] = useState(initialPrompt);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "model",
      text: t("chat.welcome"),
    },
  ]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || sending) return;

    setError("");
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setSending(true);

    const modelMsgId = `m-${Date.now()}`;
    let streamedReply = "";

    try {
      const apiMessages = nextHistory
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          mode,
          language: currentLanguage.englishName,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("text/event-stream") || !res.body) {
        let errText = "Could not get a response from BhoomiBandhu AI.";
        try {
          const errJson = (await res.json()) as { error?: string; reply?: string };
          if (res.ok && errJson.reply) {
            streamedReply = errJson.reply;
          } else if (errJson.error) {
            errText = errJson.error;
          }
        } catch {
          // ignore JSON parse failure
        }
        if (!streamedReply) {
          throw new Error(errText);
        }
      } else {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        setMessages([
          ...nextHistory,
          { id: modelMsgId, role: "model", text: "", mode },
        ]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const evt of events) {
            const line = evt
              .split("\n")
              .find((l) => l.startsWith("data: "));
            if (!line) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;
            const parsed = JSON.parse(jsonStr) as {
              chunk?: string;
              error?: string;
              done?: boolean;
            };
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.chunk) {
              streamedReply += parsed.chunk;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === modelMsgId ? { ...m, text: streamedReply } : m
                )
              );
            }
          }
        }
      }

      if (!streamedReply.trim()) {
        throw new Error("Could not get a response from BhoomiBandhu AI.");
      }

      const finalMessages: ChatMessage[] = [
        ...nextHistory,
        { id: modelMsgId, role: "model", text: streamedReply, mode },
      ];
      setMessages(finalMessages);

      // Persist snapshot for signed-in Firebase users
      if (user && !user.isDemoSession) {
        try {
          const compactMessages = finalMessages
            .filter((m) => m.id !== "welcome")
            .slice(-20)
            .map((m) => ({ role: m.role, text: m.text.slice(0, 1500) }));
          await addDoc(collection(db, "chat_sessions"), {
            userId: user.uid,
            title: trimmed.slice(0, 80),
            mode,
            messages: compactMessages,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch {
          // non-blocking save
        }
      }
    } catch (err) {
      if (!streamedReply.trim()) {
        setMessages(nextHistory);
      }
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to BhoomiBandhu AI."
      );
    } finally {
      setSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  useEffect(() => {
    setMessages((prev) =>
      prev.length === 1 && prev[0].id === "welcome"
        ? [{ id: "welcome", role: "model", text: t("chat.welcome") }]
        : prev
    );
  }, [t]);

  const clearChat = () => {
    setError("");
    setMessages([
      {
        id: "welcome",
        role: "model",
        text: t("chat.welcome"),
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-11rem)] md:h-[calc(100vh-7.5rem)] bg-white rounded-2xl border border-[#2D6A4F]/15 overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 md:px-6 py-3.5 border-b border-[#2D6A4F]/15 flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F3]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base md:text-lg text-[#1B2A20]">
              {t("chat.title")}
            </h1>
            <p className="text-xs text-[#4A5A4F]">
              {t("chat.subtitle")} · {currentLanguage.nativeName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Reasoning Mode Selector */}
          <div
            className="flex items-center gap-1 p-1 bg-[#F2EFE6] rounded-xl"
            role="group"
            aria-label="AI reasoning mode"
          >
            <button
              type="button"
              onClick={() => setMode("fast")}
              className={`min-h-[36px] px-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors ${
                mode === "fast"
                  ? "bg-white text-[#2D6A4F] shadow-sm"
                  : "text-[#4A5A4F]"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Fast</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("balanced")}
              className={`min-h-[36px] px-2.5 rounded-lg text-xs font-semibold transition-colors ${
                mode === "balanced"
                  ? "bg-white text-[#2D6A4F] shadow-sm"
                  : "text-[#4A5A4F]"
              }`}
            >
              Balanced
            </button>
            <button
              type="button"
              onClick={() => setMode("deep")}
              className={`min-h-[36px] px-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors ${
                mode === "deep"
                  ? "bg-white text-[#2D6A4F] shadow-sm"
                  : "text-[#4A5A4F]"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Deep Thinking</span>
            </button>
          </div>

          <button
            type="button"
            onClick={clearChat}
            aria-label="Clear conversation"
            className="min-h-[36px] min-w-[36px] rounded-xl border border-[#2D6A4F]/20 text-[#4A5A4F] hover:text-[#1B2A20] hover:bg-[#F2EFE6] flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Thread */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#FAF8F3]/60"
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0 mt-0.5">
                  <Sprout className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? "bg-[#FCE8C3] text-[#1B2A20]"
                    : "bg-white border border-[#2D6A4F]/15 text-[#1B2A20]"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            <div className="bg-white border border-[#2D6A4F]/15 rounded-2xl px-4 py-3 text-sm text-[#4A5A4F]">
              {mode === "deep"
                ? "Thinking carefully through your question..."
                : "Preparing a clear answer..."}
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Suggestion Chips + Input Bar */}
      <div className="p-3 md:p-4 border-t border-[#2D6A4F]/15 bg-white space-y-3">
        <div className="flex items-center sm:flex-wrap gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => sendMessage(chip)}
              disabled={sending}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/20 text-xs font-medium text-[#2D6A4F] hover:bg-[#EAF4EE] whitespace-nowrap shrink-0 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <label htmlFor="ai-chat-input" className="sr-only">
            Ask about crops, schemes, or storage
          </label>
          <input
            id="ai-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chat.placeholder")}
            className="flex-1 h-12 px-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            aria-label={t("chat.send")}
            className="min-h-[48px] min-w-[48px] px-4 rounded-xl bg-[#2D6A4F] hover:bg-[#1E4D38] disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">{t("chat.send")}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
