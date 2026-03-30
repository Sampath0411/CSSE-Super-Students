// QR Attendance Types and Utilities

export interface Classroom {
  id: string;
  name: string;
  building: string;
  floor: number;
  latitude: number;
  longitude: number;
}

export interface QRSession {
  id: string;
  subjectId: string;
  classroomId: string;
  teacherId: string;
  period: number;
  date: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface QRAttendanceRecord {
  sessionId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  scannedAt: string;
  studentLatitude: number;
  studentLongitude: number;
  distanceFromClassroom: number;
  isValid: boolean;
  invalidReason?: string;
}

// Classrooms at Andhra University CSSE Department - Room A33
export const classrooms: Classroom[] = [
  { id: "A33", name: "Room A33 (Main Classroom)", building: "CSSE Block", floor: 3, latitude: 17.7337, longitude: 83.3186 },
  { id: "LAB1", name: "Computer Lab 1", building: "CSSE Block", floor: 2, latitude: 17.7338, longitude: 83.3187 },
  { id: "LAB2", name: "Computer Lab 2", building: "CSSE Block", floor: 2, latitude: 17.7336, longitude: 83.3185 },
  { id: "SEMINAR", name: "Seminar Hall", building: "Main Block", floor: 0, latitude: 17.7339, longitude: 83.3188 },
  { id: "LH101", name: "Lecture Hall 101", building: "Main Block", floor: 1, latitude: 17.7340, longitude: 83.3189 },
];

// Haversine formula to calculate distance between two coordinates
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Generate a unique session ID
export function generateSessionId(): string {
  return `QRS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// Create QR data payload
export function createQRPayload(session: QRSession): string {
  const payload = {
    sid: session.id,
    lat: session.latitude,
    lon: session.longitude,
    rad: session.radiusMeters,
    exp: session.expiresAt,
    sub: session.subjectId,
    per: session.period,
  };
  return btoa(JSON.stringify(payload));
}

// Parse QR data payload
export function parseQRPayload(encoded: string): {
  sid: string;
  lat: number;
  lon: number;
  rad: number;
  exp: string;
  sub: string;
  per: number;
} | null {
  try {
    const decoded = atob(encoded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Validate if student is within allowed radius
export function validateLocation(
  studentLat: number,
  studentLon: number,
  classroomLat: number,
  classroomLon: number,
  allowedRadius: number
): { isValid: boolean; distance: number; message: string } {
  const distance = calculateDistance(studentLat, studentLon, classroomLat, classroomLon);
  
  if (distance <= allowedRadius) {
    return {
      isValid: true,
      distance: Math.round(distance * 10) / 10,
      message: `You are ${Math.round(distance)}m from the classroom. Attendance marked!`,
    };
  }
  
  return {
    isValid: false,
    distance: Math.round(distance * 10) / 10,
    message: `You are ${Math.round(distance)}m away. Must be within ${allowedRadius}m of the classroom.`,
  };
}

// Check if session is expired
export function isSessionExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

export function getClassroomById(id: string): Classroom | undefined {
  return classrooms.find((c) => c.id === c.id);
}

// Store active sessions (in-memory for demo, use Redis/database in production)
const activeSessions: Map<string, QRSession> = new Map();

export function storeSession(session: QRSession): void {
  activeSessions.set(session.id, session);
}

export function getSession(sessionId: string): QRSession | undefined {
  return activeSessions.get(sessionId);
}

export function removeSession(sessionId: string): void {
  activeSessions.delete(sessionId);
}

export function getAllActiveSessions(): QRSession[] {
  return Array.from(activeSessions.values()).filter(s => !isSessionExpired(s.expiresAt));
}
