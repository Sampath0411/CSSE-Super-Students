"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  MapPin,
  Smartphone,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Navigation,
  BookOpen,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  getSessionState,
  validateOTP,
  getStudentLocation,
  validateLocation,
  registerFingerprint,
  isSessionActive,
  SESSION_KEYS,
  validateSessionCode,
  getSharedSession,
  parseSessionFromUrl,
} from "@/lib/anti-proxy";
import { type Student, calculateStudentAttendance, ATTENDANCE_THRESHOLD } from "@/lib/data";

interface VerificationStatus {
  otp: "pending" | "success" | "error";
  gps: "pending" | "success" | "error";
  device: "pending" | "success" | "error";
}

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
  const [sessionFeatures, setSessionFeatures] = useState({
    otp: false,
    gps: false,
    device: false,
  });
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({});
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    otp: "pending",
    gps: "pending",
    device: "pending",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [locationData, setLocationData] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    const storedStudent = sessionStorage.getItem("studentUser");
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    }

    // Check for session in URL first (from QR code or shared link)
    const urlSession = parseSessionFromUrl();
    if (urlSession.valid && urlSession.session) {
      setSessionActive(true);
      setSessionFeatures({
        otp: !!urlSession.session.otp,
        gps: !!urlSession.session.teacherLocation,
        device: true,
      });
      setSessionInfo({
        subjectId: urlSession.session.subjectId,
        subjectName: urlSession.session.subjectName,
        period: urlSession.session.period,
      });
      setSuccessMessage("Joined session via link! Complete the verifications below.");
    }

    // Check session state
    const checkSession = () => {
      const active = isSessionActive();
      setSessionActive(active);

      if (active) {
        const session = getSessionState();
        setSessionFeatures({
          otp: !!session.otp,
          gps: !!session.teacherLocation,
          device: true, // Device check is always available
        });
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

  // Join session using code
  const joinSession = async () => {
    if (!sessionCodeInput || sessionCodeInput.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit session code");
      return;
    }

    setIsJoining(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = validateSessionCode(sessionCodeInput);

      if (result.valid && result.session) {
        setSessionActive(true);
        setSessionFeatures({
          otp: !!result.session.otp,
          gps: !!result.session.teacherLocation,
          device: true,
        });
        setSessionInfo({
          subjectId: result.session.subjectId,
          subjectName: result.session.subjectName,
          period: result.session.period,
        });
        setSuccessMessage("Session joined successfully! Complete the verifications below.");
      } else {
        setErrorMessage(result.message);
      }
    } catch (err) {
      setErrorMessage("Failed to join session. Please try again.");
    }

    setIsJoining(false);
  };

  const verifyOTP = () => {
    if (!otpInput || otpInput.length !== 6) {
      setErrorMessage("Please enter a 6-digit OTP");
      setVerificationStatus((prev) => ({ ...prev, otp: "error" }));
      return;
    }

    const result = validateOTP(otpInput);
    if (result.valid) {
      setVerificationStatus((prev) => ({ ...prev, otp: "success" }));
      setErrorMessage("");
    } else {
      setErrorMessage(result.message);
      setVerificationStatus((prev) => ({ ...prev, otp: "error" }));
    }
  };

  const verifyLocation = async () => {
    setIsVerifying(true);
    setErrorMessage("");

    try {
      const studentLoc = await getStudentLocation();
      setLocationData(studentLoc);

      const session = getSessionState();
      if (!session.teacherLocation) {
        setErrorMessage("Teacher location not set");
        setVerificationStatus((prev) => ({ ...prev, gps: "error" }));
        setIsVerifying(false);
        return;
      }

      const validation = validateLocation(
        studentLoc.lat,
        studentLoc.lng,
        session.teacherLocation.lat,
        session.teacherLocation.lng,
        10
      );

      setDistance(validation.distance);

      if (validation.valid) {
        setVerificationStatus((prev) => ({ ...prev, gps: "success" }));
        setSuccessMessage(validation.message);
      } else {
        setErrorMessage(validation.message);
        setVerificationStatus((prev) => ({ ...prev, gps: "error" }));
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Location verification failed");
      setVerificationStatus((prev) => ({ ...prev, gps: "error" }));
    }

    setIsVerifying(false);
  };

  const verifyDevice = () => {
    if (!student) {
      setErrorMessage("Student not authenticated");
      setVerificationStatus((prev) => ({ ...prev, device: "error" }));
      return;
    }

    const result = registerFingerprint(student.id);
    if (result.success) {
      setVerificationStatus((prev) => ({ ...prev, device: "success" }));
      setSuccessMessage(result.message);
    } else {
      setErrorMessage(result.message);
      setVerificationStatus((prev) => ({ ...prev, device: "error" }));
    }
  };

  const allVerified =
    (!sessionFeatures.otp || verificationStatus.otp === "success") &&
    (!sessionFeatures.gps || verificationStatus.gps === "success") &&
    (!sessionFeatures.device || verificationStatus.device === "success");

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
              Scan the QR code from your teacher&apos;s screen or enter the session code
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
            <div className="text-xs text-amber-600 space-y-1">
              <p>Ask your teacher for the session code displayed on their screen</p>
              <p className="text-amber-500 italic">Note: For best results, scan the QR code or use the shareable link</p>
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
          {sessionFeatures.otp && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Key className="h-5 w-5" />
                  OTP Verification
                  <StatusBadge status={verificationStatus.otp} />
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
                    disabled={verificationStatus.otp === "success"}
                    className="text-center text-2xl tracking-widest font-mono"
                  />
                  <Button
                    onClick={verifyOTP}
                    disabled={otpInput.length !== 6 || verificationStatus.otp === "success"}
                  >
                    {verificationStatus.otp === "success" ? (
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
          )}

          {/* GPS Verification */}
          {sessionFeatures.gps && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                  Location Verification
                  <StatusBadge status={verificationStatus.gps} />
                </CardTitle>
                <CardDescription>
                  Your location will be verified against the classroom location
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {locationData ? (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-primary" />
                      <span className="font-medium">Your Location</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Lat: {locationData.lat.toFixed(6)}, Lng: {locationData.lng.toFixed(6)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Accuracy: ±{Math.round(locationData.accuracy)}m
                    </p>
                    {distance !== null && (
                      <p
                        className={`text-sm font-medium ${
                          distance <= 10 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        Distance from classroom: {Math.round(distance)}m
                        {distance > 10 && " (Max allowed: 10m)"}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Click verify to capture your location</p>
                  </div>
                )}
                <Button
                  onClick={verifyLocation}
                  disabled={isVerifying || verificationStatus.gps === "success"}
                  className="w-full"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : verificationStatus.gps === "success" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Location Verified
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      Verify Location
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Device Verification */}
          {sessionFeatures.device && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smartphone className="h-5 w-5" />
                  Device Verification
                  <StatusBadge status={verificationStatus.device} />
                </CardTitle>
                <CardDescription>
                  Prevents proxy attendance and multiple students using the same device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Your device will be fingerprinted using browser characteristics.
                    This prevents:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>Someone else marking attendance for you</li>
                    <li>Multiple students using the same device</li>
                    <li>Device switching during the session</li>
                  </ul>
                </div>
                <Button
                  onClick={verifyDevice}
                  disabled={verificationStatus.device === "success"}
                  className="w-full"
                >
                  {verificationStatus.device === "success" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Device Registered
                    </>
                  ) : (
                    <>
                      <Smartphone className="h-4 w-4 mr-2" />
                      Register This Device
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

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
          <Card className={allVerified ? "border-green-500 border-2" : ""}>
            <CardContent className="pt-6">
              <div className="text-center">
                {allVerified ? (
                  <>
                    <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      All Verifications Complete!
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
                      Complete All Verifications
                    </h3>
                    <p className="text-amber-600">
                      Finish the required checks above to proceed
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
}
