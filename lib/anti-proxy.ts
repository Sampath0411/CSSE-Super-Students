// Anti-Proxy Protection Utilities
// Client-side only - no external libraries

export interface AntiProxySession {
  subjectId?: string;
  subjectName?: string;
  period?: number;
  otp?: string;
  otpExpiry?: number;
  teacherLocation?: { lat: number; lng: number };
  fingerprints: Record<string, string>;
  sessionActive: boolean;
}

export interface EncodedSessionData {
  subjectId: string;
  subjectName: string;
  period: number;
  otp?: string;
  otpExpiry?: number;
  teacherLocation?: { lat: number; lng: number };
  createdAt: number;
}

// Session storage keys
export const SESSION_KEYS = {
  subjectId: "antiProxy_subjectId",
  subjectName: "antiProxy_subjectName",
  period: "antiProxy_period",
  otp: "antiProxy_otp",
  otpExpiry: "antiProxy_otpExpiry",
  teacherLocation: "antiProxy_teacherLocation",
  fingerprints: "antiProxy_fingerprints",
  sessionActive: "antiProxy_sessionActive",
  sessionCode: "antiProxy_sessionCode",
  // Shared session data (for cross-device sync)
  sharedSession: "antiProxy_sharedSession",
};

// Generate a 6-digit session code
export function generateSessionCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store session with code for cross-device access
export function storeSharedSession(sessionCode: string, sessionData: {
  subjectId: string;
  subjectName: string;
  period: number;
  otp?: string;
  otpExpiry?: number;
  teacherLocation?: { lat: number; lng: number };
  createdAt: number;
}): void {
  if (typeof window === "undefined") return;

  const sharedData = {
    ...sessionData,
    sessionCode,
    active: true,
  };

  localStorage.setItem(SESSION_KEYS.sharedSession, JSON.stringify(sharedData));
  localStorage.setItem(SESSION_KEYS.sessionCode, sessionCode);
}

// Get shared session by code
export function getSharedSession(): {
  subjectId: string;
  subjectName: string;
  period: number;
  otp?: string;
  otpExpiry?: number;
  teacherLocation?: { lat: number; lng: number };
  sessionCode: string;
  createdAt: number;
  active: boolean;
} | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(SESSION_KEYS.sharedSession);
  if (!stored) return null;

  try {
    const session = JSON.parse(stored);
    // Check if session is still valid (8 hours)
    const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
    if (Date.now() - session.createdAt > SESSION_DURATION) {
      localStorage.removeItem(SESSION_KEYS.sharedSession);
      return null;
    }
    return session.active ? session : null;
  } catch {
    return null;
  }
}

// Validate session code entered by student
export function validateSessionCode(inputCode: string): {
  valid: boolean;
  message: string;
  session?: {
    subjectId: string;
    subjectName: string;
    period: number;
    otp?: string;
    otpExpiry?: number;
    teacherLocation?: { lat: number; lng: number };
  };
} {
  if (typeof window === "undefined") {
    return { valid: false, message: "Cannot validate session" };
  }

  const stored = localStorage.getItem(SESSION_KEYS.sharedSession);
  if (!stored) {
    return { valid: false, message: "No active session found. Ask your teacher to start a session first." };
  }

  try {
    const session = JSON.parse(stored);

    if (!session.active) {
      return { valid: false, message: "Session has ended" };
    }

    if (session.sessionCode !== inputCode) {
      return { valid: false, message: "Invalid session code. Please check with your teacher." };
    }

    // Check if session is expired
    const SESSION_DURATION = 8 * 60 * 60 * 1000;
    if (Date.now() - session.createdAt > SESSION_DURATION) {
      localStorage.removeItem(SESSION_KEYS.sharedSession);
      return { valid: false, message: "Session has expired" };
    }

    // Copy session data to local storage for this device
    localStorage.setItem(SESSION_KEYS.sessionActive, "true");
    localStorage.setItem(SESSION_KEYS.subjectId, session.subjectId);
    localStorage.setItem(SESSION_KEYS.subjectName, session.subjectName);
    localStorage.setItem(SESSION_KEYS.period, session.period.toString());
    if (session.otp) localStorage.setItem(SESSION_KEYS.otp, session.otp);
    if (session.otpExpiry) localStorage.setItem(SESSION_KEYS.otpExpiry, session.otpExpiry.toString());
    if (session.teacherLocation) {
      localStorage.setItem(SESSION_KEYS.teacherLocation, JSON.stringify(session.teacherLocation));
    }
    localStorage.setItem(SESSION_KEYS.fingerprints, JSON.stringify({}));

    return {
      valid: true,
      message: "Session joined successfully",
      session: {
        subjectId: session.subjectId,
        subjectName: session.subjectName,
        period: session.period,
        otp: session.otp,
        otpExpiry: session.otpExpiry,
        teacherLocation: session.teacherLocation,
      }
    };
  } catch {
    return { valid: false, message: "Invalid session data" };
  }
}

// Generate device fingerprint using browser characteristics
export function generateDeviceFingerprint(): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Canvas fingerprint
  ctx!.textBaseline = "top";
  ctx!.font = "14px 'Arial'";
  ctx!.fillText("Anti-Proxy Fingerprint", 2, 2);
  ctx!.fillStyle = "#f60";
  ctx!.fillRect(125, 1, 62, 20);
  const canvasData = canvas.toDataURL();

  const components = [
    navigator.userAgent,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.language,
    navigator.platform,
    typeof navigator.hardwareConcurrency !== "undefined" ? navigator.hardwareConcurrency : "",
    canvasData,
  ];

  // Simple hash function
  const str = components.join("###");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// Haversine formula to calculate distance between two coordinates in meters
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Get current session state
export function getSessionState(): AntiProxySession {
  if (typeof window === "undefined") {
    return { fingerprints: {}, sessionActive: false };
  }

  const subjectId = localStorage.getItem(SESSION_KEYS.subjectId);
  const subjectName = localStorage.getItem(SESSION_KEYS.subjectName);
  const period = localStorage.getItem(SESSION_KEYS.period);
  const otp = localStorage.getItem(SESSION_KEYS.otp);
  const otpExpiry = localStorage.getItem(SESSION_KEYS.otpExpiry);
  const teacherLocation = localStorage.getItem(SESSION_KEYS.teacherLocation);
  const fingerprints = localStorage.getItem(SESSION_KEYS.fingerprints);
  const sessionActive = localStorage.getItem(SESSION_KEYS.sessionActive);

  return {
    subjectId: subjectId || undefined,
    subjectName: subjectName || undefined,
    period: period ? parseInt(period) : undefined,
    otp: otp || undefined,
    otpExpiry: otpExpiry ? parseInt(otpExpiry) : undefined,
    teacherLocation: teacherLocation ? JSON.parse(teacherLocation) : undefined,
    fingerprints: fingerprints ? JSON.parse(fingerprints) : {},
    sessionActive: sessionActive === "true",
  };
}

// Clear session data
export function clearSession(): void {
  if (typeof window === "undefined") return;
  Object.values(SESSION_KEYS).forEach((key) => localStorage.removeItem(key));
}

// Validate OTP
export function validateOTP(inputOtp: string): { valid: boolean; message: string } {
  const session = getSessionState();

  if (!session.otp) {
    return { valid: false, message: "No active OTP session" };
  }

  if (session.otpExpiry && Date.now() > session.otpExpiry) {
    return { valid: false, message: "OTP has expired" };
  }

  if (session.otp !== inputOtp) {
    return { valid: false, message: "Invalid OTP" };
  }

  return { valid: true, message: "OTP verified" };
}

// Get student location with high accuracy
export function getStudentLocation(): Promise<{
  lat: number;
  lng: number;
  accuracy: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (err) => {
        let message = "Unable to get location";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = "Location permission denied";
            break;
          case err.POSITION_UNAVAILABLE:
            message = "Location unavailable";
            break;
          case err.TIMEOUT:
            message = "Location request timed out";
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  });
}

// Validate location against teacher's location
export function validateLocation(
  studentLat: number,
  studentLng: number,
  teacherLat: number,
  teacherLng: number,
  maxDistance: number = 10
): { valid: boolean; distance: number; message: string } {
  const distance = calculateDistance(studentLat, studentLng, teacherLat, teacherLng);

  if (distance <= maxDistance) {
    return {
      valid: true,
      distance,
      message: `Within range (${Math.round(distance)}m)`,
    };
  }

  return {
    valid: false,
    distance,
    message: `Too far from classroom (${Math.round(distance)}m away, max ${maxDistance}m)`,
  };
}

// Register device fingerprint for student
export function registerFingerprint(studentId: string): { success: boolean; message: string } {
  const session = getSessionState();
  const fingerprint = generateDeviceFingerprint();
  const fingerprints = session.fingerprints || {};

  // Check if this fingerprint is already registered to another student
  for (const [existingId, existingFp] of Object.entries(fingerprints)) {
    if (existingFp === fingerprint && existingId !== studentId) {
      return {
        success: false,
        message: "Suspicious: This device was already used by another student",
      };
    }
  }

  // Check if this student already has a different fingerprint
  if (fingerprints[studentId] && fingerprints[studentId] !== fingerprint) {
    return {
      success: false,
      message: "Proxy detected: Different device from previous attendance",
    };
  }

  // Register fingerprint
  fingerprints[studentId] = fingerprint;
  localStorage.setItem(SESSION_KEYS.fingerprints, JSON.stringify(fingerprints));

  return {
    success: true,
    message: "Device registered",
  };
}

// Check if session is active
export function isSessionActive(): boolean {
  const session = getSessionState();
  return session.sessionActive;
}

// Encode session data for URL sharing (base64)
export function encodeSessionData(sessionData: EncodedSessionData): string {
  try {
    const json = JSON.stringify(sessionData);
    return btoa(json);
  } catch {
    return "";
  }
}

// Decode session data from URL
export function decodeSessionData(encoded: string): EncodedSessionData | null {
  try {
    const json = atob(encoded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Generate a shareable URL with session data
export function generateShareableUrl(sessionData: EncodedSessionData): string {
  const encoded = encodeSessionData(sessionData);
  // Check if we're in browser
  if (typeof window === "undefined") return "";
  const baseUrl = window.location.origin;
  return `${baseUrl}/student/verify-attendance?session=${encoded}`;
}

// Parse session from URL parameters
export function parseSessionFromUrl(): {
  valid: boolean;
  message: string;
  session?: EncodedSessionData;
} {
  if (typeof window === "undefined") {
    return { valid: false, message: "Cannot parse session" };
  }

  const urlParams = new URLSearchParams(window.location.search);
  const encoded = urlParams.get("session");

  if (!encoded) {
    return { valid: false, message: "No session data found" };
  }

  const sessionData = decodeSessionData(encoded);

  if (!sessionData) {
    return { valid: false, message: "Invalid session data" };
  }

  // Check if session is still valid (8 hours)
  const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
  if (Date.now() - sessionData.createdAt > SESSION_DURATION) {
    return { valid: false, message: "Session has expired" };
  }

  // Store the session data locally
  localStorage.setItem(SESSION_KEYS.sessionActive, "true");
  localStorage.setItem(SESSION_KEYS.subjectId, sessionData.subjectId);
  localStorage.setItem(SESSION_KEYS.subjectName, sessionData.subjectName);
  localStorage.setItem(SESSION_KEYS.period, sessionData.period.toString());
  if (sessionData.otp) {
    localStorage.setItem(SESSION_KEYS.otp, sessionData.otp);
  }
  if (sessionData.otpExpiry) {
    localStorage.setItem(SESSION_KEYS.otpExpiry, sessionData.otpExpiry.toString());
  }
  if (sessionData.teacherLocation) {
    localStorage.setItem(SESSION_KEYS.teacherLocation, JSON.stringify(sessionData.teacherLocation));
  }
  localStorage.setItem(SESSION_KEYS.fingerprints, JSON.stringify({}));

  return {
    valid: true,
    message: "Session loaded successfully",
    session: sessionData,
  };
}
