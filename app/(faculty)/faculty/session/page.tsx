"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Radio, MapPin, Copy, Square, QrCode, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { subjects } from "@/lib/data";
import {
  generateSessionCode,
  generateShareableUrl,
  storeSharedSession,
  clearSession,
  getStudentLocation,
  type EncodedSessionData,
} from "@/lib/anti-proxy";

interface ActiveSession extends EncodedSessionData {
  sessionCode: string;
  url: string;
}

export default function LiveSessionPage() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [useLocation, setUseLocation] = useState(false);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  const startSession = async () => {
    if (!selectedSubject || !selectedPeriod) {
      toast.error("Select a subject and period first.");
      return;
    }

    const subject = subjects.find((s) => s.id === selectedSubject);
    // One single code: students type it OR scan the QR — both resolve to the same session.
    const code = generateSessionCode();
    const createdAt = Date.now();
    const otpExpiry = createdAt + 30 * 60 * 1000; // 30 minutes

    let teacherLocation: { lat: number; lng: number } | undefined;
    if (useLocation) {
      try {
        setLoadingLoc(true);
        const loc = await getStudentLocation();
        teacherLocation = { lat: loc.lat, lng: loc.lng };
        toast.success("Classroom location captured.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not get location.");
        setLoadingLoc(false);
        return;
      } finally {
        setLoadingLoc(false);
      }
    }

    const sessionData: EncodedSessionData = {
      subjectId: selectedSubject,
      subjectName: subject?.name || "",
      period: parseInt(selectedPeriod),
      otp: code,
      otpExpiry,
      teacherLocation,
      createdAt,
    };

    storeSharedSession(code, sessionData);
    const url = generateShareableUrl(sessionData);
    setSession({ ...sessionData, sessionCode: code, url });
    toast.success("Live session started.");
  };

  const stopSession = () => {
    clearSession();
    setSession(null);
    toast.info("Session ended.");
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Radio className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Attendance Session</h1>
          <p className="text-muted-foreground">
            Students scan the QR or enter the OTP to mark themselves present — with anti-proxy checks.
          </p>
        </div>
      </div>

      {!session ? (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Start a session</CardTitle>
            <CardDescription>Pick the subject and period for this class.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.code} - {s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                    <SelectItem key={p} value={p.toString()}>Period {p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={useLocation}
                onChange={(e) => setUseLocation(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Require students to be near the classroom (geofence)
            </label>
            <Button className="w-full" onClick={startSession} disabled={loadingLoc}>
              <Radio className="h-4 w-4 mr-2" />
              {loadingLoc ? "Getting location..." : "Start Session"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" /> Scan to mark attendance
              </CardTitle>
              <CardDescription>
                {session.subjectName} · Period {session.period}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-xl">
                <QRCodeCanvas value={session.url} size={220} />
              </div>
              <Button variant="outline" size="sm" onClick={() => copy(session.url, "Link")}>
                <Copy className="h-4 w-4 mr-2" /> Copy join link
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" /> Class Code
              </CardTitle>
              <CardDescription>Read this code out — students type it to mark present.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div>
                  <p className="text-sm text-muted-foreground">Code</p>
                  <p className="text-4xl font-bold font-mono tracking-[0.3em] text-primary">{session.otp}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => copy(session.otp || "", "Code")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {session.teacherLocation && (
                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertDescription>
                    Geofence active — students must be within 10m of this classroom.
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-xs text-muted-foreground">
                Code expires in 30 minutes. Students can scan the QR <strong>or</strong> enter this code on
                the same network/device.
              </p>
              <Button variant="destructive" className="w-full" onClick={stopSession}>
                <Square className="h-4 w-4 mr-2" /> End Session
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
