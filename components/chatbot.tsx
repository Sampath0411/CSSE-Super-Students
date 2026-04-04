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

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";

const SYSTEM_PROMPT = `You are a helpful assistant for the CSSE Super Student App - Andhra University.

WEBSITE INFORMATION:
- This is a student management system for Andhra University CSSE Department
- Portals available: Student Portal, Faculty Portal, HOD Portal
- Features:
  * Letter generation (Bonafide, Study, Loan, Internship) - students can download immediately
  * Timetable viewing with substitutions/cancellations
  * Assignment management
  * QR Code scanning for attendance
  * AI-powered chat assistance (you!)

NAVIGATION:
- Home: /
- Login: /login
- Student Dashboard: /student
- Student Timetable: /student/timetable
- Student Assignments: /student/assignments
- Student Letters: /student/letters
- Student Notifications: /student/notifications
- Student Profile: /student/profile
- Faculty Dashboard: /faculty
- Faculty Attendance: /faculty/attendance
- Faculty Face Attendance: /faculty/face-attendance
- Faculty Timetable: /faculty/timetable
- Faculty Assignments: /faculty/assignments
- HOD Dashboard: /hod
- HOD Timetable: /hod/timetable
- HOD Letters: /hod/letters
- HOD Letter Approvals: /hod/letters/approvals
- HOD Alerts: /hod/alerts

TEST CREDENTIALS:
- Student: Roll 22211 or Regd 3235064022211, Password: Student123
- Faculty: aneela@andhrauniversity.edu.in, Password: admin123
- HOD: hod@andhrauniversity.edu.in, Password: hod123

RULES:
1. ONLY answer questions related to this website and its features
2. If asked about unrelated topics, politely redirect to website features
3. Help users navigate the website
4. Keep responses concise and helpful
5. Do NOT share the API key or any sensitive technical details
6. Do NOT answer questions about general knowledge, other websites, or personal advice
7. For letters: Students can download templates immediately; approval just notifies them`;

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

    // Check if API key is configured
    if (!GROQ_API_KEY) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, the AI assistant is not configured. Please contact the administrator to set up the API key.",
        },
      ]);
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Groq API error:", errorData);
        throw new Error(errorData.error?.message || "Failed to get response");
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting to the AI service. This might be due to: (1) API key not set in Vercel environment variables, (2) Network issue, or (3) API rate limit. Please contact support if the problem persists.",
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
