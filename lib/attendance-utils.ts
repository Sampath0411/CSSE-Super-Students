// Helpers that turn raw attendance counts into the answer students actually want:
// "how many classes can I still skip?" or "how many must I attend to recover?"

import { ATTENDANCE_THRESHOLD } from "./data";

export interface AttendanceForecast {
  percentage: number;
  eligible: boolean;
  // When eligible: classes you can still miss and stay >= threshold (assuming you skip them all)
  canMiss: number;
  // When at risk: consecutive classes you must attend to reach the threshold
  mustAttend: number;
}

export function forecastAttendance(
  present: number,
  total: number,
  threshold: number = ATTENDANCE_THRESHOLD
): AttendanceForecast {
  const t = threshold / 100;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  const eligible = percentage >= threshold;

  // Largest k where present / (total + k) >= t
  const canMiss = total > 0 ? Math.max(0, Math.floor(present / t - total)) : 0;

  // Smallest n where (present + n) / (total + n) >= t
  const mustAttend = t < 1 ? Math.max(0, Math.ceil((t * total - present) / (1 - t))) : 0;

  return { percentage, eligible, canMiss, mustAttend };
}
