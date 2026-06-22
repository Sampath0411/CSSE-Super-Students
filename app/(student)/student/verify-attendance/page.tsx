"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle2, MapPin, QrCode, BookOpen } from "lucide-react";
import { toast } from "sonner";
import {
  parseSessionFromUrl,
  validateSessionCode,
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
  const [code, setCode] = useState("");
  const [marking, setMarking] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("studentUser");
    if (!stored) {
      router.push("/login");
      return;
    }
    setStudent(JSON.parse(stored));

    // A QR scan carries the whole session in the URL — load it if present.
    if (searchParams.get("session")) {
      const result = parseSessionFromUrl();
      if (result.valid) {
        setSession(getSessionState());
        toast.success("Session loaded from QR code.");
        return;
      }
      toast.error(result.message);
    }
    const existing = getSessionState();
    if (existing.sessionActive) setSession(existing);
  }, [searchParams, router]);

  // If the teacher ends the session in another tab, localStorage clears and a
  // "storage" event fires here — drop the student back to the join screen.
  useEffect(() => {
    const onStorage = () => {
      const fresh = getSessionState();
      if (!fresh.sessionActive && !done) {
        setSession(null);
        toast.info("The teacher ended this session.");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [done]);

  // Runs the anti-proxy checks and marks the student present.
  const markPresent = async () => {
    if (!student) return;
    // Re-read the live session at click time so an ended/expired session is blocked.
    const active = getSessionState();
    if (!active.sessionActive || !active.subjectId || !active.period) {
      toast.error("This session has ended. Ask your teacher to start it again.");
      setSession(null);
      return;
    }
    if (active.otpExpiry && Date.now() > active.otpExpiry) {
      toast.error("This session has expired.");
      setSession(null);
      return;
    }
    setMarking(true);
    try {
      // Device fingerprint (stops one phone marking many students)
      const fp = registerFingerprint(student.id);
      if (!fp.success) {
        toast.error(fp.message);
        return;
      }
      // Optional geofence
      if (active.teacherLocation) {
        const loc = await getStudentLocation();
        const locRes = validateLocation(
          loc.lat,
          loc.lng,
          active.teacherLocation.lat,
          active.teacherLocation.lng,
          10
        );
        if (!locRes.valid) {
          toast.error(locRes.message);
          return;
        }
      }
      addAttendanceRecord({
        studentId: student.id,
        subjectId: active.subjectId,
        date: new Date().toISOString().split("T")[0],
        period: active.period,
        status: "present",
        markedBy: "SELF_QR",
      });
      setDone(true);
      toast.success("You're marked present!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not mark attendance.");
    } finally {
      setMarking(false);
    }
  };

  // Manual path: validate the typed code, then mark present in one step.
  const submitCode = async () => {
    const res = validateSessionCode(code.trim());
    if (!res.valid) {
      toast.error(res.message);
      return;
    }
    setSession(getSessionState());
    await markPresent();
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

  const isActive = !!session?.sessionActive;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Mark Attendance</CardTitle>
          <CardDescription>
            {isActive ? "You're connected to a live class session" : "Enter the code your teacher is showing"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          {isActive ? (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <BookOpen className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm text-foreground">{session?.subjectName}</p>
                  <p className="text-xs text-muted-foreground">Period {session?.period}</p>
                </div>
              </div>
              {session?.teacherLocation && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Location check required — allow location access.
                </p>
              )}
              <Button className="w-full" size="lg" onClick={() => markPresent()} disabled={marking}>
                {marking ? "Verifying..." : "Mark me Present"}
              </Button>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3">
                <InputOTP maxLength={6} value={code} onChange={setCode} containerClassName="justify-center">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-12 w-11 text-lg" />
                    <InputOTPSlot index={1} className="h-12 w-11 text-lg" />
                    <InputOTPSlot index={2} className="h-12 w-11 text-lg" />
                    <InputOTPSlot index={3} className="h-12 w-11 text-lg" />
                    <InputOTPSlot index={4} className="h-12 w-11 text-lg" />
                    <InputOTPSlot index={5} className="h-12 w-11 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button className="w-full" size="lg" onClick={submitCode} disabled={code.length < 6 || marking}>
                {marking ? "Verifying..." : "Mark me Present"}
              </Button>
              <Alert>
                <QrCode className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  On a different phone? Scan the teacher&apos;s <strong>QR code</strong> instead — the typed code
                  only works on the same device/browser as the session.
                </AlertDescription>
              </Alert>
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
