"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle2, MapPin, KeyRound } from "lucide-react";
import { toast } from "sonner";
import {
  parseSessionFromUrl,
  validateSessionCode,
  validateOTP,
  registerFingerprint,
  getSessionState,
  getStudentLocation,
  validateLocation,
  type AntiProxySession,
} from "@/lib/anti-proxy";
import { addAttendanceRecord } from "@/lib/attendance-store";
import { type Student } from "@/lib/data";

function VerifyAttendanceInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [session, setSession] = useState<AntiProxySession | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [marking, setMarking] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("studentUser");
    if (!stored) {
      router.push("/login");
      return;
    }
    setStudent(JSON.parse(stored));

    // A QR scan carries the session in the URL — load it if present.
    if (searchParams.get("session")) {
      const result = parseSessionFromUrl();
      if (result.valid) {
        setSession(getSessionState());
        toast.success("Session loaded from QR.");
      } else {
        toast.error(result.message);
      }
    } else {
      const existing = getSessionState();
      if (existing.sessionActive) setSession(existing);
    }
  }, [searchParams, router]);

  const joinByCode = () => {
    const result = validateSessionCode(codeInput.trim());
    if (!result.valid) {
      toast.error(result.message);
      return;
    }
    setSession(getSessionState());
    toast.success("Joined session.");
  };

  const markPresent = async () => {
    if (!student || !session?.subjectId || !session.period) return;
    setMarking(true);
    try {
      // 1) OTP check
      if (session.otp) {
        const otpRes = validateOTP(otpInput.trim());
        if (!otpRes.valid) {
          toast.error(otpRes.message);
          return;
        }
      }
      // 2) Anti-proxy device fingerprint
      const fp = registerFingerprint(student.id);
      if (!fp.success) {
        toast.error(fp.message);
        return;
      }
      // 3) Geofence (only if the teacher enabled it)
      if (session.teacherLocation) {
        const loc = await getStudentLocation();
        const locRes = validateLocation(
          loc.lat,
          loc.lng,
          session.teacherLocation.lat,
          session.teacherLocation.lng,
          10
        );
        if (!locRes.valid) {
          toast.error(locRes.message);
          return;
        }
      }
      // 4) Mark present
      addAttendanceRecord({
        studentId: student.id,
        subjectId: session.subjectId,
        date: new Date().toISOString().split("T")[0],
        period: session.period,
        status: "present",
        markedBy: "SELF_QR",
      });
      setDone(true);
      toast.success("Attendance marked present!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not mark attendance.");
    } finally {
      setMarking(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <CardTitle>You&apos;re marked present</CardTitle>
            <CardDescription>{session?.subjectName} · Period {session?.period}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push("/student")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Verify Attendance</CardTitle>
          <CardDescription>Mark yourself present for a live class session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {session?.sessionActive ? (
            <>
              <Alert>
                <KeyRound className="h-4 w-4" />
                <AlertDescription>
                  Active session: <strong>{session.subjectName}</strong> · Period {session.period}
                </AlertDescription>
              </Alert>
              {session.otp && (
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter the OTP shown by your teacher</Label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    placeholder="6-digit OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                  />
                </div>
              )}
              {session.teacherLocation && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Location check is required for this session.
                </p>
              )}
              <Button className="w-full" onClick={markPresent} disabled={marking}>
                {marking ? "Verifying..." : "Mark me Present"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Scan the QR code shown by your teacher, or enter the 6-digit session code below.
              </p>
              <div className="space-y-2">
                <Label htmlFor="code">Session Code</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  placeholder="6-digit session code"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={joinByCode} disabled={!codeInput.trim()}>
                Join Session
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => router.push("/student")}>
                Back to Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyAttendancePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <VerifyAttendanceInner />
    </Suspense>
  );
}
