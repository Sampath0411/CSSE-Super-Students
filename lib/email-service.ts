// Email Service for Attendance Alerts
// In production, use SendGrid, AWS SES, or Nodemailer with SMTP

import { students, type Student, calculateStudentAttendance } from "./data";

// Store sent alerts to prevent spam
const sentAlerts = new Map<string, Date>();
const ALERT_COOLDOWN_HOURS = 24; // Don't send same alert within 24 hours

interface EmailAlert {
  studentId: string;
  studentEmail: string;
  studentName: string;
  attendancePercentage: number;
  subject?: string;
  sentAt: string;
}

// Mock email sending - logs to console
// Replace with actual email service in production
export async function sendAttendanceAlert(
  student: Student,
  attendancePercentage: number,
  subjectName?: string
): Promise<boolean> {
  const alertKey = `${student.id}-${new Date().toISOString().split("T")[0]}`;

  // Check if alert already sent recently
  const lastAlert = sentAlerts.get(alertKey);
  if (lastAlert) {
    const hoursSinceLastAlert = (Date.now() - lastAlert.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastAlert < ALERT_COOLDOWN_HOURS) {
      console.log(`Alert already sent to ${student.name} within ${ALERT_COOLDOWN_HOURS} hours`);
      return false;
    }
  }

  const emailContent = {
    to: student.email,
    subject: `⚠️ Attendance Alert - Below 75%`,
    body: `
Dear ${student.name},

This is an automated alert from CSSE Attendance System.

Your current attendance percentage is ${attendancePercentage}%, which is below the required 75% threshold.

${subjectName ? `Subject: ${subjectName}` : 'Overall attendance'}

Details:
- Student Name: ${student.name}
- Roll Number: ${student.rollNumber}
- Registration No: ${student.regdNo}
- Current Attendance: ${attendancePercentage}%
- Required: 75%

Please ensure you attend your classes regularly to meet the minimum attendance requirement for examination eligibility.

Contact your department if you have any concerns.

Best regards,
CSSE Department
Andhra University
    `,
  };

  try {
    // MOCK: Log to console (replace with actual email API)
    console.log("=".repeat(60));
    console.log("📧 EMAIL ALERT SENT");
    console.log("=".repeat(60));
    console.log(`To: ${emailContent.to}`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log("-".repeat(60));
    console.log(emailContent.body);
    console.log("=".repeat(60));

    // Store alert log
    const alertLog: EmailAlert = {
      studentId: student.id,
      studentEmail: student.email,
      studentName: student.name,
      attendancePercentage,
      subject: subjectName,
      sentAt: new Date().toISOString(),
    };

    // Store in localStorage for persistence
    const existingLogs = JSON.parse(localStorage.getItem("emailAlerts") || "[]");
    existingLogs.push(alertLog);
    localStorage.setItem("emailAlerts", JSON.stringify(existingLogs));

    // Mark as sent
    sentAlerts.set(alertKey, new Date());

    return true;
  } catch (error) {
    console.error("Failed to send email alert:", error);
    return false;
  }
}

// Check attendance and send alerts
export function checkAndSendAttendanceAlert(
  studentId: string,
  subjectId?: string
): void {
  const student = students.find((s) => s.id === studentId);
  if (!student) return;

  const attendance = calculateStudentAttendance(studentId, subjectId);
  const THRESHOLD = 75;

  if (attendance.percentage < THRESHOLD) {
    const subjectName = subjectId
      ? require("./data").subjects.find((s: any) => s.id === subjectId)?.name
      : undefined;

    sendAttendanceAlert(student, attendance.percentage, subjectName);
  }
}

// Get all sent alerts
export function getEmailAlerts(): EmailAlert[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("emailAlerts") || "[]");
}

// Get alerts for specific student
export function getStudentAlerts(studentId: string): EmailAlert[] {
  return getEmailAlerts().filter((alert) => alert.studentId === studentId);
}

// Clear old alerts (older than 30 days)
export function clearOldAlerts(): void {
  if (typeof window === "undefined") return;

  const alerts = getEmailAlerts();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const filtered = alerts.filter(
    (alert) => new Date(alert.sentAt) > thirtyDaysAgo
  );

  localStorage.setItem("emailAlerts", JSON.stringify(filtered));
}
