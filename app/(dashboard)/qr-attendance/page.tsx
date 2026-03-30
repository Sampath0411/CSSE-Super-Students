"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  QrCode,
  MapPin,
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Timer,
  Scan,
  MapPinned,
  Users,
  AlertTriangle,
  Copy,
  Check
} from "lucide-react";
import { subjects, students, getStudentById } from "@/lib/data";
import {
  classrooms,
  generateSessionId,
  createQRPayload,
  storeSession,
  type QRSession,
  type QRAttendanceRecord
} from "@/lib/qr-attendance";

const RADIUS_OPTIONS = [
  { value: 10, label: "10 meters (Classroom)" },
  { value: 20, label: "20 meters (Small Hall)" },
  { value: 50, label: "50 meters (Large Hall)" },
];

const EXPIRY_OPTIONS = [
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
];

export default function QRAttendancePage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedRadius, setSelectedRadius] = useState<number>(10);
  const [selectedExpiry, setSelectedExpiry] = useState<number>(10);
  const [activeSession, setActiveSession] = useState<QRSession | null>(null);
  const [qrValue, setQrValue] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [attendanceRecords, setAttendanceRecords] = useState<QRAttendanceRecord[]>([]);
  const [copied, setCopied] = useState(false);

  // Timer for session expiry
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(activeSession.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setActiveSession(null);
        setQrValue("");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Simulate receiving attendance records (in real app, this would be WebSocket or polling)
  useEffect(() => {
    if (!activeSession) return;

    // Simulate some students scanning using real student data
    const simulateScans = () => {
      const mockScans: QRAttendanceRecord[] = [
        {
          sessionId: activeSession.id,
          studentId: "STU211",
          studentName: "Karedla Tanush Sai",
          rollNumber: "22211",
          scannedAt: new Date().toISOString(),
          studentLatitude: activeSession.latitude + 0.00002,
          studentLongitude: activeSession.longitude + 0.00001,
          distanceFromClassroom: 3.2,
          isValid: true,
        },
        {
          sessionId: activeSession.id,
          studentId: "STU212",
          studentName: "Karnam Nivrutha Naidu",
          rollNumber: "22212",
          scannedAt: new Date(Date.now() - 30000).toISOString(),
          studentLatitude: activeSession.latitude + 0.00005,
          studentLongitude: activeSession.longitude + 0.00003,
          distanceFromClassroom: 7.8,
          isValid: true,
        },
        {
          sessionId: activeSession.id,
          studentId: "STU213",
          studentName: "Karri Swathi Kumar",
          rollNumber: "22213",
          scannedAt: new Date(Date.now() - 60000).toISOString(),
          studentLatitude: activeSession.latitude + 0.0002,
          studentLongitude: activeSession.longitude + 0.0001,
          distanceFromClassroom: 28.5,
          isValid: false,
          invalidReason: "Outside allowed radius (28.5m > 10m)",
        },
      ];
      setAttendanceRecords(mockScans);
    };

    const timeout = setTimeout(simulateScans, 2000);
    return () => clearTimeout(timeout);
  }, [activeSession]);

  const generateQRCode = () => {
    if (!selectedSubject || !selectedClassroom || !selectedPeriod) {
      return;
    }

    const classroom = classrooms.find((c) => c.id === selectedClassroom);
    if (!classroom) return;

    const now = new Date();
    const expiryTime = new Date(now.getTime() + selectedExpiry * 60 * 1000);

    const session: QRSession = {
      id: generateSessionId(),
      subjectId: selectedSubject,
      classroomId: selectedClassroom,
      teacherId: "T001", // Current logged-in teacher
      period: parseInt(selectedPeriod),
      date: now.toISOString().split("T")[0],
      latitude: classroom.latitude,
      longitude: classroom.longitude,
      radiusMeters: selectedRadius,
      createdAt: now.toISOString(),
      expiresAt: expiryTime.toISOString(),
      isActive: true,
    };

    setActiveSession(session);
    storeSession(session);
    setQrValue(createQRPayload(session));
    setTimeRemaining(selectedExpiry * 60);
    setAttendanceRecords([]);
  };

  const stopSession = () => {
    setActiveSession(null);
    setQrValue("");
    setTimeRemaining(0);
  };

  const refreshQRCode = () => {
    if (activeSession) {
      const newId = generateSessionId();
      const newSession = { ...activeSession, id: newId };
      setActiveSession(newSession);
      storeSession(newSession);
      setQrValue(createQRPayload(newSession));
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const copyQRCode = () => {
    if (qrValue) {
      navigator.clipboard.writeText(qrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectedSubjectData = subjects.find((s) => s.id === selectedSubject);
  const selectedClassroomData = classrooms.find((c) => c.id === selectedClassroom);
  const validScans = attendanceRecords.filter((r) => r.isValid).length;
  const invalidScans = attendanceRecords.filter((r) => !r.isValid).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <QrCode className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">QR Attendance</h1>
            <p className="text-muted-foreground">
              Generate location-based QR codes for attendance
            </p>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <MapPinned className="h-4 w-4" />
        <AlertTitle>Location-Based Verification</AlertTitle>
        <AlertDescription>
          Students must be physically present within the specified radius of the classroom to mark their attendance. 
          The QR code encodes GPS coordinates and validates student location in real-time.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Generator Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Generate QR Code
            </CardTitle>
            <CardDescription>
              Configure session parameters and generate a QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject Selection */}
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
                disabled={!!activeSession}
              >
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

            {/* Classroom Selection */}
            <div className="space-y-2">
              <Label>Classroom</Label>
              <Select
                value={selectedClassroom}
                onValueChange={setSelectedClassroom}
                disabled={!!activeSession}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} ({room.building}, Floor {room.floor})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Period Selection */}
            <div className="space-y-2">
              <Label>Period</Label>
              <Select
                value={selectedPeriod}
                onValueChange={setSelectedPeriod}
                disabled={!!activeSession}
              >
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

            {/* Radius Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Allowed Radius
              </Label>
              <Select
                value={selectedRadius.toString()}
                onValueChange={(v) => setSelectedRadius(parseInt(v))}
                disabled={!!activeSession}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RADIUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expiry Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                QR Code Validity
              </Label>
              <Select
                value={selectedExpiry.toString()}
                onValueChange={(v) => setSelectedExpiry(parseInt(v))}
                disabled={!!activeSession}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              {!activeSession ? (
                <Button
                  onClick={generateQRCode}
                  disabled={!selectedSubject || !selectedClassroom || !selectedPeriod}
                  className="flex-1"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Button>
              ) : (
                <>
                  <Button onClick={refreshQRCode} variant="outline" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Code
                  </Button>
                  <Button onClick={stopSession} variant="destructive" className="flex-1">
                    <XCircle className="h-4 w-4 mr-2" />
                    End Session
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* QR Display Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Active QR Code
              </span>
              {activeSession && (
                <Badge variant={timeRemaining > 60 ? "default" : "destructive"} className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {formatTime(timeRemaining)}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Display this QR code to students for scanning
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeSession && qrValue ? (
              <div className="space-y-4">
                {/* QR Code Display */}
                <div className="flex justify-center p-6 bg-white rounded-lg border">
                  <QRCodeSVG
                    value={qrValue}
                    size={220}
                    level="H"
                    includeMargin
                    imageSettings={{
                      src: "",
                      height: 24,
                      width: 24,
                      excavate: true,
                    }}
                  />
                </div>

                {/* Session Info */}
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-medium">{selectedSubjectData?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Classroom:</span>
                    <span className="font-medium">{selectedClassroomData?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Period:</span>
                    <span className="font-medium">Period {selectedPeriod}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Allowed Radius:</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedRadius}m
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Session ID:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {activeSession.id}
                    </code>
                  </div>
                </div>

                {/* Copy QR Code Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Manual Entry Code:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyQRCode}
                      className="flex items-center gap-1"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-xs break-all font-mono text-muted-foreground">
                      {qrValue}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Students can paste this code manually if camera scanning doesn&apos;t work.
                  </p>
                </div>

                {/* Instructions */}
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Students must scan this QR code within <strong>{selectedRadius} meters</strong> of {selectedClassroomData?.name}.
                    The code expires in <strong>{formatTime(timeRemaining)}</strong>.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <QrCode className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-center">
                  Configure the session parameters and click<br />
                  &quot;Generate QR Code&quot; to start
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Attendance Feed */}
      {activeSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Live Attendance Feed
              </span>
              <div className="flex gap-2">
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {validScans} Valid
                </Badge>
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {invalidScans} Invalid
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Real-time attendance records from QR scans
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceRecords.length > 0 ? (
              <div className="space-y-2">
                {attendanceRecords.map((record, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      record.isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {record.isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{record.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          Roll: {record.rollNumber} | {record.isValid
                            ? `Distance: ${record.distanceFromClassroom}m - Attendance marked`
                            : record.invalidReason}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(record.scannedAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Scan className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>Waiting for students to scan the QR code...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student Instructions */}
      <Tabs defaultValue="instructions">
        <TabsList>
          <TabsTrigger value="instructions">Student Instructions</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>
        <TabsContent value="instructions">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <span className="font-bold text-primary">1</span>
                  </div>
                  <h4 className="font-medium mb-1">Open Scanner</h4>
                  <p className="text-sm text-muted-foreground">
                    Students open the QR Scanner page on their device
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <span className="font-bold text-primary">2</span>
                  </div>
                  <h4 className="font-medium mb-1">Allow Location</h4>
                  <p className="text-sm text-muted-foreground">
                    Grant location permission when prompted by the browser
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <span className="font-bold text-primary">3</span>
                  </div>
                  <h4 className="font-medium mb-1">Scan QR Code</h4>
                  <p className="text-sm text-muted-foreground">
                    Point camera at QR code while in classroom
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="troubleshooting">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Location Not Working</h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure GPS is enabled and location permissions are granted to the browser. Indoor locations may have reduced GPS accuracy.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">QR Code Expired</h4>
                  <p className="text-sm text-muted-foreground">
                    If the QR code has expired, the teacher needs to generate a new one. Contact your instructor.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Outside Radius</h4>
                  <p className="text-sm text-muted-foreground">
                    You must be physically present within {selectedRadius || 10} meters of the classroom to mark attendance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
