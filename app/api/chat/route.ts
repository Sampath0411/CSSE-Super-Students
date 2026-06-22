import { NextRequest, NextResponse } from "next/server";

// Server-side Groq proxy so the API key is never exposed to the browser.
// Set GROQ_API_KEY (NOT NEXT_PUBLIC_) in your environment / Vercel project.
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

const SYSTEM_PROMPT = `You are a helpful assistant for the CSSE Super Student App - Andhra University.

WEBSITE INFORMATION:
- This is a student management system for Andhra University CSSE Department
- Portals available: Student Portal, Faculty Portal, HOD Portal
- Features:
  * Letter generation (Bonafide, Study, Loan, Internship) - students can download immediately
  * Timetable viewing with substitutions/cancellations
  * Assignment management
  * Live QR/OTP attendance sessions (anti-proxy)
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
- Faculty Live Session: /faculty/session
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

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: "AI assistant is not configured. Set GROQ_API_KEY in the server environment." },
      { status: 503 }
    );
  }

  let messages: ChatMessage[] = [];
  try {
    const body = await req.json();
    messages = Array.isArray(body.messages) ? body.messages : [];
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Keep only the last 12 turns to bound token usage
  const trimmed = messages.slice(-12).map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }));

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmed],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData?.error?.message || "Failed to get a response from the AI service." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request.";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Network error contacting the AI service." }, { status: 502 });
  }
}
