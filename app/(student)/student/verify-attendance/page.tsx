"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  BookOpen,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  getSessionState,
  validateOTP,
  isSessionActive,
  SESSION_KEYS,
} from "@/lib/anti-proxy";
import { getSessionFromSupabase, type SessionRecord } from "@/lib/supabase";
import { type Student, calculateStudentAttendance, ATTENDANCE_THRESHOLD } from "@/lib/data";

interface SessionInfo {
  subjectId?: string;
  subjectName?: string;
  period?: number;
}

export default function VerifyAttendancePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [sessionCodeInput, setSessionCodeInput] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({});
  const [otpVerified, setOtpVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const storedStudent = sessionStorage.getItem("studentUser");
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    }

    // Check for OTP in URL (from teacher's shared code)
    const checkUrlSession = async () => {
      if (typeof window === "undefined") return;
      const urlParams = new URLSearchParams(window.location.search);
      const otpFromUrl = urlParams.get("code");

      if (otpFromUrl) {
        setSessionCodeInput(otpFromUrl);
        // Auto-join session from URL using OTP
        await joinSessionWithCode(otpFromUrl);
      }
    };

    checkUrlSession();

    // Check local session state
    const checkSession = () => {
      const active = isSessionActive();
      setSessionActive(active);

      if (active) {
        const session = getSessionState();
        setSessionInfo({
          subjectId: session.subjectId,
          subjectName: session.subjectName,
          period: session.period,
        });
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 2000);
    return () => clearInterval(interval);
  }, []);

  // Join session using OTP (from Supabase)
  const joinSessionWithCode = async (code: string) => {
    setIsJoining(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await getSessionFromSupabase(code);

      if (result.success && result.session) {
        const session = result.session;

        // Store session locally
        localStorage.setItem(SESSION_KEYS.sessionActive, "true");
        localStorage.setItem(SESSION_KEYS.subjectId, session.subject_id);
        localStorage.setItem(SESSION_KEYS.subjectName, session.subject_name);
        localStorage.setItem(SESSION_KEYS.period, session.period.toString());
        if (session.otp) {
          localStorage.setItem(SESSION_KEYS.otp, session.otp);
        }
        if (session.otp_expiry) {
          localStorage.setItem(SESSION_KEYS.otpExpiry, session.otp_expiry.toString());
        }

        setSessionActive(true);
        setSessionInfo({
          subjectId: session.subject_id,
          subjectName: session.subject_name,
          period: session.period,
        });
        setSuccessMessage("Session joined successfully! Complete the verifications below.");
      } else {
        setErrorMessage(result.error || "Session not found. Ask your teacher to start a new session.");
      }
    } catch (err) {
      setErrorMessage("Failed to join session. Please try again.");
    }

    setIsJoining(false);
  };

  // Join session button handler
  const joinSession = async () => {
    if (!sessionCodeInput || sessionCodeInput.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit session code");
      return;
    }
    await joinSessionWithCode(sessionCodeInput);
  };

  const verifyOTP = () => {
    if (!otpInput || otpInput.length !== 6) {
      setErrorMessage("Please enter a 6-digit OTP");
      return;
    }

    const result = validateOTP(otpInput);
    if (result.valid) {
      setOtpVerified(true);
      setErrorMessage("");
    } else {
      setErrorMessage(result.message);
      setOtpVerified(false);
    }
  };

  // Calculate attendance when all verified
  const [attendanceData, setAttendanceData] = useState<{
    percentage: number;
    total: number;
    present: number;
    isEligible: boolean;
  } | null>(null);

  useEffect(() => {
    if (allVerified && student) {
      const data = calculateStudentAttendance(student.id);
      setAttendanceData({
        percentage: data.percentage,
        total: data.total,
        present: data.present,
        isEligible: data.percentage >= ATTENDANCE_THRESHOLD,
      });
    }
  }, [allVerified, student]);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6" />
          Verify Attendance
        </h1>
        <p className="text-muted-foreground mt-1">
          Complete anti-proxy verification to mark your attendance
        </p>
      </div>

      {/* Session Status */}
      {!sessionActive ? (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Key className="h-5 w-5" />
              Join Attendance Session
            </CardTitle>
            <CardDescription className="text-amber-700">
              Enter the 6-digit OTP from your teacher to join the attendance session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={sessionCodeInput}
                onChange={(e) => setSessionCodeInput(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest font-mono"
              />
              <Button
                onClick={joinSession}
                disabled={sessionCodeInput.length !== 6 || isJoining}
              >
                {isJoining ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Session"
                )}
              </Button>
            </div>
            <div className="text-xs text-amber-600">
              <p>Ask your teacher for the 6-digit OTP displayed on their screen</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Active session detected! Complete the required verifications below.
          </AlertDescription>
        </Alert>
      )}

      {sessionActive && (
        <>
          {/* Session Info */}
          {(sessionInfo.subjectName || sessionInfo.period) && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">Session Details</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {sessionInfo.subjectName && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Subject:</span>
                      <Badge variant="secondary">{sessionInfo.subjectName}</Badge>
                    </div>
                  )}
                  {sessionInfo.period && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Period:</span>
                      <Badge variant="secondary">{sessionInfo.period}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* OTP Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-5 w-5" />
                OTP Verification
                {otpVerified && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Enter the 6-digit OTP displayed on your teacher&apos;s screen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  disabled={otpVerified}
                  className="text-center text-2xl tracking-widest font-mono"
                />
                <Button
                  onClick={verifyOTP}
                  disabled={otpInput.length !== 6 || otpVerified}
                >
                  {otpVerified ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                OTP expires in 90 seconds. Ask your teacher to regenerate if expired.
              </p>
            </CardContent>
          </Card>

          {/* Error/Success Messages */}
          {errorMessage && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Attendance Summary (shown when all verified) */}
          {allVerified && attendanceData && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Your Attendance Summary
                </CardTitle>
                <CardDescription>
                  Current semester attendance statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 rounded-lg bg-muted/50">
                  <p className="text-5xl font-bold text-foreground">
                    {attendanceData.percentage}%
                  </p>                  <p className="text-sm text-muted-foreground mt-1">Overall Attendance</p>
                  <div className="mt-3 h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        attendanceData.isEligible ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{ width: `${attendanceData.percentage}%` }}
                    />
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant={attendanceData.isEligible ? "default" : "destructive"}
                    >
                      {attendanceData.isEligible ? "Exam Eligible ✓" : "At Risk ⚠"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                    <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-700">{attendanceData.present}</p>
                    <p className="text-xs text-green-600">Classes Attended</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                    <TrendingDown className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-700">
                      {attendanceData.total - attendanceData.present}
                    </p>
                    <p className="text-xs text-red-600">Classes Missed</p>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Total Classes: {attendanceData.total}</p>
                  <p>Minimum Required: {ATTENDANCE_THRESHOLD}%</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Final Status */}
          <Card className={otpVerified ? "border-green-500 border-2" : ""}>
            <CardContent className="pt-6">
              <div className="text-center">
                {otpVerified ? (
                  <>
                    <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      OTP Verified!
                    </h3>
                    <p className="text-green-600 mb-4">
                      You can now proceed with face recognition attendance
                    </p>
                    <Button size="lg" asChild>
                      <a href="/face-attendance">Go to Face Recognition</a>
                    </Button>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-amber-800 mb-2">
                      Complete OTP Verification
                    </h3>
                    <p className="text-amber-600">
                      Enter the 6-digit OTP from your teacher to proceed
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "success" | "error" }) {
  if (status === "success") {
    return (
      <Badge variant="default" className="bg-green-600">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    );
  }
  if (status === "error") {
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Failed
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      <Loader2 className="h-3 w-3 mr-1" />
      Pending
    </Badge>
  );
}>
      Pending
    </Badge>
  );
}
