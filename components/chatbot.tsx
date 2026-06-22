"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your CSSE Super Student App assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const nextMessages = [...messages, { role: "user" as const, content: userMessage }];
    setInput("");
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data?.error || "Sorry, I'm having trouble reaching the AI service right now. Please try again shortly.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "I'm sorry, I couldn't process that request." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please check your network and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-[100] p-0 hover:scale-105 transition-transform"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] max-w-[400px] h-[500px] bg-background border rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b bg-primary text-primary-foreground py-3 px-4 flex items-center gap-2 shrink-0">
            <Bot className="h-5 w-5" />
            <span className="text-sm font-semibold">CSSE Assistant</span>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-lg px-3 py-2 text-sm break-words whitespace-pre-wrap overflow-hidden ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                  style={{
                    maxWidth: "calc(100% - 48px)",
                    wordBreak: "break-word"
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                  <span className="animate-pulse">Typing...</span>
                </div>
              </div>
            )}

            {/* Scroll to bottom anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-3 flex gap-2 shrink-0 bg-background">
            <Input
              placeholder="Ask about the website..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
