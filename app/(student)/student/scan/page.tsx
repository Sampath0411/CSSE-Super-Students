"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Scan,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  Camera,
  Navigation,
  AlertTriangle,
  Clock,
  RefreshCw,
  Keyboard,
} from "lucide-react";
import { parseQRPayload, validateLocation, isSessionExpired } from "@/lib/qr-attendance";
import { subjects, type Student } from "@/lib/data";
import { addAttendanceRecord } from "@/lib/attendance-store";

type ScanStatus = "idle" | "scanning" | "getting-location" | "validating" | "success" | "error";

interface ScanResult {
  status: "success" | "error";
  message: string;
  details?: {
    subject?: string;
    period?: number;
    distance?: number;
    timestamp?: string;
  };
}

export default function StudentScanPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("");
  const [manualCode, setManualCode] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lon: number;
    accuracy: number;
  } | null>(null);

  useEffect(() => {
    const storedStudent = sessionStorage.getItem("studentUser");
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    }
  }, []);

  const getCurrentLocation = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      setLocationStatus("Getting your location...");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setLocationStatus(`Location acquired (accuracy: ${Math.round(position.coords.accuracy)}m)`);
          resolve(position);
        },
        (error) => {
          let errorMessage = "Unable to get location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }
          setLocationStatus(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  const processQRCode = useCallback(async (decodedText: string) => {
    setStatus("validating");

    try {
      const payload = parseQRPayload(decodedText);
      if (!payload) {
        throw new Error("Invalid QR code format");
      }

      if (isSessionExpired(payload.exp)) {
        throw new Error("This QR code has expired. Please ask your teacher to generate a new one.");
      }

      setStatus("getting-location");
      const position = await getCurrentLocation();

      const validation = validateLocation(
        position.coords.latitude,
        position.coords.longitude,
        payload.lat,
        payload.lon,
        payload.rad
      );

      const subject = subjects.find((s) => s.id === payload.sub);

      if (validation.isValid) {
        // Save attendance record
        if (student) {
          const today = new Date().toISOString().split("T")[0];
          addAttendanceRecord({
            studentId: student.id,
            subjectId: payload.sub,
            date: today,
            period: payload.per,
            status: "present",
            markedBy: "QR_SYSTEM",
          });
        }

        setStatus("success");
        setScanResult({
          status: "success",
          message: "Attendance marked successfully!",
          details: {
            subject: subject?.name || "Unknown Subject",
            period: payload.per,
            distance: validation.distance,
            timestamp: new Date().toLocaleString(),
          },
        });
      } else {
        setStatus("error");
        setScanResult({
          status: "error",
          message: validation.message,
          details: {
            subject: subject?.name || "Unknown Subject",
            period: payload.per,
            distance: validation.distance,
          },
        });
      }
    } catch (error) {
      setStatus("error");
      setScanResult({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to process QR code",
      });
    }
  }, [getCurrentLocation, student]);

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    processQRCode(manualCode.trim());
  };

  const resetScan = () => {
    setStatus("idle");
    setScanResult(null);
    setLocationStatus("");
    setManualCode("");
  };

  // File upload handler for QR code images
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("scanning");

    try {
      // Dynamically import html5-qrcode
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("dummy-reader");

      const result = await html5QrCode.scanFile(file, false);
      await html5QrCode.clear();

      if (result) {
        processQRCode(result);
      }
    } catch (error) {
      setStatus("error");
      setScanResult({
        status: "error",
        message: "Could not read QR code from image. Try entering the code manually.",
      });
    }
  };

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Scan className="h-6 w-6" />
          QR Attendance
        </h1>
        <p className="text-muted-foreground mt-1">
          Scan the QR code or enter the code manually
        </p>
      </div>

      {/* Scanner Card */}
      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
          <CardDescription>
            Scan the QR code displayed by your teacher or enter it manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Idle State */}
          {status === "idle" && !scanResult && (
            <div className="space-y-4">
              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="qr-file-input"
              />

              <div className="text-center py-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-12 w-12 text-primary/50" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Choose how to scan the QR code
                </p>
              </div>

              <div className="grid gap-3">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("qr-file-input")?.click()}
                  className="w-full py-6"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Upload QR Code Image
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowManual(!showManual)}
                  className="w-full py-6"
                >
                  <Keyboard className="h-5 w-5 mr-2" />
                  Enter Code Manually
                </Button>
              </div>

              {/* Manual Entry */}
              {showManual && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium mb-2 block">
                    Paste the QR code content here:
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste the long code from QR..."
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleManualSubmit} disabled={!manualCode.trim()}>
                      Submit
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Ask your teacher to copy and share the QR code content if camera scanning isn&apos;t working.
                  </p>
                </div>
              )}

              {/* Dummy div for file scanner cleanup */}
              <div id="dummy-reader" className="hidden" />
            </div>
          )}

          {/* Scanning State */}
          {status === "scanning" && (
            <div className="space-y-4 text-center py-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <p className="font-medium">Processing QR code...</p>
              <Button onClick={() => setStatus("idle")} variant="outline">
                Cancel
              </Button>
            </div>
          )}

          {/* Getting Location State */}
          {status === "getting-location" && (
            <div className="flex items-center justify-center gap-2 py-8">
              <Navigation className="h-6 w-6 animate-pulse text-primary" />
              <span className="font-medium">Getting your location...</span>
            </div>
          )}

          {/* Validating State */}
          {status === "validating" && (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="font-medium">Validating attendance...</span>
            </div>
          )}

          {/* Location Status */}
          {locationStatus && status !== "success" && status !== "error" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
              <MapPin className="h-4 w-4" />
              <span>{locationStatus}</span>
            </div>
          )}

          {/* Success Result */}
          {status === "success" && scanResult && (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800">
                  Attendance Marked!
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  {scanResult.message}
                </AlertDescription>
              </Alert>

              {scanResult.details && (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-medium">{scanResult.details.subject}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Period:</span>
                    <span className="font-medium">Period {scanResult.details.period}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Distance:</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {scanResult.details.distance}m from classroom
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="h-3 w-3" />
                      {scanResult.details.timestamp}
                    </span>
                  </div>
                </div>
              )}

              <Button onClick={resetScan} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Mark Another Attendance
              </Button>
            </div>
          )}

          {/* Error Result */}
          {status === "error" && scanResult && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-5 w-5" />
                <AlertTitle>Attendance Failed</AlertTitle>
                <AlertDescription>{scanResult.message}</AlertDescription>
              </Alert>

              {scanResult.details && (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  {scanResult.details.subject && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subject:</span>
                      <span className="font-medium">{scanResult.details.subject}</span>
                    </div>
                  )}
                  {scanResult.details.distance !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Your Distance:</span>
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {scanResult.details.distance}m away
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              <Button onClick={resetScan} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Location Card */}
      {currentLocation && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Navigation className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Your Current Location</p>
                <p className="text-xs text-muted-foreground">
                  Lat: {currentLocation.lat.toFixed(6)}, Lon: {currentLocation.lon.toFixed(6)}
                </p>
              </div>
              <Badge variant="outline">±{Math.round(currentLocation.accuracy)}m</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions Card */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-2">Instructions</p>
              <ul className="text-muted-foreground space-y-1">
                <li>You must be within the specified radius of the classroom</li>
                <li>Enable GPS and grant location permission</li>
                <li>The QR code expires after a few minutes</li>
                <li>If camera doesn&apos;t work, ask teacher to share the code text</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
