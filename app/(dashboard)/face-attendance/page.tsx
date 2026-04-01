"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Camera,
  Scan,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  AlertTriangle,
  RefreshCw,
  Clock,
  MapPin,
  Smartphone,
  Key,
  Shield,
  BookOpen,
} from "lucide-react";
import * as tf from "@tensorflow/tfjs";
import { subjects, students, type Student } from "@/lib/data";
import { addAttendanceRecord } from "@/lib/attendance-store";
import { SESSION_KEYS, generateSessionCode, storeSharedSession } from "@/lib/anti-proxy";

// Model configuration
const MODEL_URL = "/models/face-detection/model.json";
const MODEL_METADATA_URL = "/models/face-detection/metadata.json";
const CONFIDENCE_THRESHOLD = 0.85;

type DetectionStatus = "idle" | "loading" | "ready" | "scanning" | "success" | "error";

interface DetectionResult {
  label: string;
  confidence: number;
  matchedStudent?: Student;
}

interface ModelMetadata {
  labels: string[];
  imageSize: number;
}

export default function FaceAttendancePage() {
  const [status, setStatus] = useState<DetectionStatus>("idle");
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [attendanceLog, setAttendanceLog] = useState<Array<{
    studentName: string;
    rollNumber: string;
    subject: string;
    period: number;
    timestamp: string;
    confidence: number;
  }>>([]);
  const [error, setError] = useState<string>("");
  const [prediction, setPrediction] = useState<string>("");

  // Anti-proxy feature states
  const [sessionActive, setSessionActive] = useState(false);
  const [otpEnabled, setOtpEnabled] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [deviceLockEnabled, setDeviceLockEnabled] = useState(false);
  const [otp, setOtp] = useState<string>("");
  const [otpTimeLeft, setOtpTimeLeft] = useState(90);
  const [teacherLocation, setTeacherLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [sessionCode, setSessionCode] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const otpTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load model and metadata
  const loadModel = useCallback(async () => {
    setStatus("loading");
    setError("");

    try {
      await tf.setBackend("webgl");
      await tf.ready();
      const loadedModel = await tf.loadLayersModel(MODEL_URL);
      setModel(loadedModel);
      const metaRes = await fetch(MODEL_METADATA_URL);
      const meta = await metaRes.json();
      setMetadata({ labels: meta.labels, imageSize: meta.imageSize });
      setStatus("ready");
    } catch (err) {
      console.error("Failed to load model:", err);
      setError("Failed to load face detection model.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadModel();
    return () => stopScanning();
  }, [loadModel]);

  // OTP Timer
  useEffect(() => {
    if (sessionActive && otpEnabled && otpTimeLeft > 0) {
      otpTimerRef.current = setInterval(() => {
        setOtpTimeLeft((prev) => {
          if (prev <= 1) {
            // OTP expired
            localStorage.removeItem(SESSION_KEYS.otp);
            localStorage.removeItem(SESSION_KEYS.otpExpiry);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    };
  }, [sessionActive, otpEnabled, otpTimeLeft]);

  // Generate 6-digit OTP
  const generateOTP = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(newOtp);
    setOtpTimeLeft(90);
    const expiry = Date.now() + 90000; // 90 seconds
    localStorage.setItem(SESSION_KEYS.otp, newOtp);
    localStorage.setItem(SESSION_KEYS.otpExpiry, expiry.toString());
  };

  // Capture teacher location
  const captureTeacherLocation = () => {
    setIsCapturingLocation(true);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsCapturingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setTeacherLocation(location);
        localStorage.setItem(SESSION_KEYS.teacherLocation, JSON.stringify(location));
        setIsCapturingLocation(false);
      },
      (err) => {
        let errorMsg = "Unable to retrieve location";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = "Location permission denied";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = "Location information unavailable";
            break;
          case err.TIMEOUT:
            errorMsg = "Location request timed out";
            break;
        }
        setError(errorMsg);
        setIsCapturingLocation(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  };

  // Start session
  const startSession = () => {
    if (!selectedSubject || !selectedPeriod) {
      setError("Please select subject and period first");
      return;
    }

    // Generate unique session code for cross-device sync
    const newSessionCode = generateSessionCode();
    setSessionCode(newSessionCode);

    setSessionActive(true);
    localStorage.setItem(SESSION_KEYS.sessionActive, "true");
    localStorage.setItem(SESSION_KEYS.fingerprints, JSON.stringify({}));

    // Store subject and period info
    const subject = subjects.find(s => s.id === selectedSubject);
    localStorage.setItem(SESSION_KEYS.subjectId, selectedSubject);
    localStorage.setItem(SESSION_KEYS.subjectName, subject?.name || "");
    localStorage.setItem(SESSION_KEYS.period, selectedPeriod);

    // Generate OTP if enabled
    let sessionOtp: string | undefined;
    let sessionOtpExpiry: number | undefined;
    if (otpEnabled) {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      sessionOtp = newOtp;
      sessionOtpExpiry = Date.now() + 90000;
      setOtp(newOtp);
      setOtpTimeLeft(90);
      localStorage.setItem(SESSION_KEYS.otp, newOtp);
      localStorage.setItem(SESSION_KEYS.otpExpiry, sessionOtpExpiry.toString());
    }

    // Capture location if enabled
    let sessionLocation: { lat: number; lng: number } | undefined;
    if (gpsEnabled) {
      if (!teacherLocation) {
        captureTeacherLocation();
      }
      sessionLocation = teacherLocation || undefined;
    }

    // Store shared session for cross-device access
    storeSharedSession(newSessionCode, {
      subjectId: selectedSubject,
      subjectName: subject?.name || "",
      period: parseInt(selectedPeriod),
      otp: sessionOtp,
      otpExpiry: sessionOtpExpiry,
      teacherLocation: sessionLocation,
      createdAt: Date.now(),
    });
  };

  // End session
  const endSession = () => {
    setSessionActive(false);
    setOtp("");
    setOtpTimeLeft(0);
    setSessionCode("");
    // Clear session data
    Object.values(SESSION_KEYS).forEach((key) => localStorage.removeItem(key));
  };

  // Webcam functions
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      throw new Error("Camera access denied.");
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Process image for prediction
  const processImage = (video: HTMLVideoElement): tf.Tensor => {
    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, 224, 224);
    const imageData = ctx.getImageData(0, 0, 224, 224);
    let tensor = tf.browser.fromPixels(imageData);
    tensor = tf.div(tensor, tf.scalar(255));
    tensor = tf.expandDims(tensor, 0);
    return tensor;
  };

  // Make prediction
  const predict = async (): Promise<{ label: string; confidence: number } | null> => {
    if (!model || !videoRef.current || !metadata) return null;
    try {
      const tensor = processImage(videoRef.current);
      const predictions = model.predict(tensor) as tf.Tensor;
      const probs = await predictions.data();
      tensor.dispose();
      predictions.dispose();
      const maxIndex = probs.indexOf(Math.max(...Array.from(probs)));
      return { label: metadata.labels[maxIndex], confidence: probs[maxIndex] };
    } catch (err) {
      console.error("Prediction error:", err);
      return null;
    }
  };

  // Start scanning
  const startScanning = async () => {
    if (!selectedSubject || !selectedPeriod) {
      setError("Please select subject and period");
      return;
    }
    if (!sessionActive) {
      setError("Please start an attendance session first");
      return;
    }

    setError("");
    setDetectionResult(null);
    setStatus("scanning");

    try {
      await startWebcam();
      intervalRef.current = setInterval(async () => {
        const result = await predict();
        if (result) {
          setPrediction(`${result.label}: ${Math.round(result.confidence * 100)}%`);
          if (result.confidence >= CONFIDENCE_THRESHOLD) {
            if (intervalRef.current) clearInterval(intervalRef.current);

            const matchedStudent = students.find((s) =>
              s.name.toLowerCase().includes(result.label.toLowerCase())
            );

            setDetectionResult({
              label: result.label,
              confidence: result.confidence,
              matchedStudent,
            });

            if (matchedStudent) {
              // Anti-proxy validation is handled when student actually confirms
              // For now, just show success
              const today = new Date().toISOString().split("T")[0];
              addAttendanceRecord({
                studentId: matchedStudent.id,
                subjectId: selectedSubject,
                date: today,
                period: parseInt(selectedPeriod),
                status: "present",
                markedBy: "FACE_SYSTEM",
              });

              const subject = subjects.find((s) => s.id === selectedSubject);
              setAttendanceLog((prev) => [
                {
                  studentName: matchedStudent.name,
                  rollNumber: matchedStudent.rollNumber,
                  subject: subject?.name || "Unknown",
                  period: parseInt(selectedPeriod),
                  timestamp: new Date().toLocaleTimeString(),
                  confidence: Math.round(result.confidence * 100),
                },
                ...prev.slice(0, 9),
              ]);

              setStatus("success");
            } else {
              setError(`Detected ${result.label} but no matching student found.`);
              setStatus("error");
            }
            stopWebcam();
          }
        }
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start camera");
      setStatus("error");
    }
  };

  const stopScanning = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopWebcam();
    setStatus("ready");
  };

  const resetScan = () => {
    setStatus("ready");
    setDetectionResult(null);
    setError("");
    setPrediction("");
    stopWebcam();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Scan className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Face Recognition Attendance</h1>
            <p className="text-muted-foreground">
              AI-powered face detection with anti-proxy protection
            </p>
          </div>
        </div>
      </div>

      {/* Session Status */}
      {!sessionActive ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No active session. Configure anti-proxy settings and start a session before scanning.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Session active! Anti-proxy features enabled: {[
              otpEnabled && "OTP",
              gpsEnabled && "GPS",
              deviceLockEnabled && "Device Lock"
            ].filter(Boolean).join(", ") || "None"}
          </AlertDescription>
        </Alert>
      )}

      {/* Anti-Proxy Control Panel */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Anti-Proxy Protection
          </CardTitle>
          <CardDescription>
            Enable security features before starting attendance session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject and Period Selection */}
          {!sessionActive && (
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.code} - {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Period</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((period) => (
                      <SelectItem key={period} value={period.toString()}>
                        Period {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Session Info Display (when active) */}
          {sessionActive && (selectedSubject || selectedPeriod) && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-medium">Active Session</span>
              </div>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Subject: </span>
                  <span className="font-medium">
                    {subjects.find(s => s.id === selectedSubject)?.code || "-"} - {subjects.find(s => s.id === selectedSubject)?.name || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Period: </span>
                  <span className="font-medium">{selectedPeriod || "-"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Session Code Display (when active) */}
          {sessionActive && sessionCode && (
            <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/30 text-center">
              <p className="text-sm text-muted-foreground mb-2">Share this code with students</p>
              <p className="text-xs text-muted-foreground mb-3">Students must enter this code on their device to join the session</p>
              <div className="text-5xl font-mono font-bold text-primary tracking-widest bg-white dark:bg-card rounded-lg py-4 shadow-inner">
                {sessionCode}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Session valid for 8 hours
              </p>
            </div>
          )}

          {/* Toggle Switches */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* OTP Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">OTP Verification</p>
                  <p className="text-xs text-muted-foreground">6-digit code, 90s expiry</p>
                </div>
              </div>
              <Switch
                checked={otpEnabled}
                onCheckedChange={setOtpEnabled}
                disabled={sessionActive}
              />
            </div>

            {/* GPS Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">GPS Location</p>
                  <p className="text-xs text-muted-foreground">10m radius check</p>
                </div>
              </div>
              <Switch
                checked={gpsEnabled}
                onCheckedChange={setGpsEnabled}
                disabled={sessionActive}
              />
            </div>

            {/* Device Lock Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Device Lock</p>
                  <p className="text-xs text-muted-foreground">Prevent proxy attendance</p>
                </div>
              </div>
              <Switch
                checked={deviceLockEnabled}
                onCheckedChange={setDeviceLockEnabled}
                disabled={sessionActive}
              />
            </div>
          </div>

          {/* OTP Display */}
          {otpEnabled && sessionActive && (
            <div className="p-6 bg-primary/5 rounded-lg border-2 border-primary/20 text-center">
              <p className="text-sm text-muted-foreground mb-2">Current OTP (expires in {otpTimeLeft}s)</p>
              <div className="text-5xl font-mono font-bold text-primary tracking-widest">
                {otp}
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateOTP}
                  disabled={otpTimeLeft > 0}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate OTP
                </Button>
              </div>
            </div>
          )}

          {/* GPS Status */}
          {gpsEnabled && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Classroom Location</p>
                    {teacherLocation ? (
                      <p className="text-xs text-muted-foreground">
                        Lat: {teacherLocation.lat.toFixed(6)}, Lng: {teacherLocation.lng.toFixed(6)}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Not set</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={captureTeacherLocation}
                  disabled={isCapturingLocation || sessionActive}
                >
                  {isCapturingLocation ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2" />
                  )}
                  {teacherLocation ? "Update Location" : "Capture Location"}
                </Button>
              </div>
            </div>
          )}

          {/* Session Controls */}
          <div className="flex justify-center">
            {!sessionActive ? (
              <Button
                size="lg"
                onClick={startSession}
                disabled={gpsEnabled && !teacherLocation}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Start Attendance Session
              </Button>
            ) : (
              <Button variant="destructive" size="lg" onClick={endSession}>
                <XCircle className="h-4 w-4 mr-2" />
                End Session
              </Button>
            )}
          </div>

          {gpsEnabled && !teacherLocation && !sessionActive && (
            <p className="text-xs text-center text-amber-600">
              Please capture classroom location before starting session
            </p>
          )}
        </CardContent>
      </Card>

      {/* Status Alert */}
      {status === "loading" && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Loading face detection model...</AlertDescription>
        </Alert>
      )}

      {status === "ready" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Model loaded successfully! Ready to scan faces.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Configure Session
            </CardTitle>
            <CardDescription>Select subject and period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((period) => (
                    <SelectItem key={period} value={period.toString()}>
                      Period {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              {status === "scanning" ? (
                <Button variant="destructive" className="w-full" onClick={stopScanning}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Stop Scanning
                </Button>
              ) : status === "success" || status === "error" ? (
                <Button className="w-full" onClick={resetScan}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Scan Next
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={startScanning}
                  disabled={status !== "ready" || !selectedSubject || !selectedPeriod || !sessionActive}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : !sessionActive ? (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Start Session First
                    </>
                  ) : (
                    <>
                      <Scan className="h-4 w-4 mr-2" />
                      Start Face Scan
                    </>
                  )}
                </Button>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Camera Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Camera Feed</CardTitle>
            <CardDescription>Position face in center</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {status === "scanning" ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-4 border-primary rounded-full animate-pulse" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-2 rounded text-center">
                    {prediction || "Scanning..."}
                  </div>
                </>
              ) : status === "success" ? (
                <div className="flex flex-col items-center justify-center h-full bg-green-50">
                  <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
                  <p className="text-lg font-semibold text-green-800">
                    {detectionResult?.matchedStudent?.name || detectionResult?.label}
                  </p>
                  <p className="text-sm text-green-600">
                    Confidence: {Math.round((detectionResult?.confidence || 0) * 100)}%
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Camera className="h-16 w-16 mb-4 opacity-20" />
                  <p>Camera will activate when scanning starts</p>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {detectionResult && (
          <Card>
            <CardHeader>
              <CardTitle>Detection Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Detected</p>
                    <p className="text-lg font-semibold">{detectionResult.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <Badge
                      variant={detectionResult.confidence >= CONFIDENCE_THRESHOLD ? "default" : "destructive"}
                      className="text-lg"
                    >
                      {Math.round(detectionResult.confidence * 100)}%
                    </Badge>
                  </div>
                </div>

                {detectionResult.matchedStudent ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600 font-medium mb-2">Attendance Marked For:</p>
                    <p className="font-semibold">{detectionResult.matchedStudent.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Roll: {detectionResult.matchedStudent.rollNumber}
                    </p>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertDescription>No matching student found</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Attendance Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceLog.length > 0 ? (
              <div className="space-y-2">
                {attendanceLog.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{log.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.subject} - Period {log.period}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {log.confidence}%
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{log.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No attendance records yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
