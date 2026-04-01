"use client";

import { timetable, type TimetableEntry, type TimetableModification } from "@/lib/data";

const MODIFICATIONS_KEY = "timetable_modifications";
const MODIFIED_TIMETABLE_KEY = "modified_timetable";

// Get modifications from localStorage
export function getModifications(): TimetableModification[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(MODIFICATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save modifications to localStorage
export function saveModifications(modifications: TimetableModification[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MODIFICATIONS_KEY, JSON.stringify(modifications));
}

// Get modified timetable entries
export function getModifiedTimetable(): TimetableEntry[] {
  if (typeof window === "undefined") return timetable;
  const stored = localStorage.getItem(MODIFIED_TIMETABLE_KEY);
  return stored ? JSON.parse(stored) : timetable;
}

// Save modified timetable to localStorage
export function saveModifiedTimetable(entries: TimetableEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MODIFIED_TIMETABLE_KEY, JSON.stringify(entries));
}

// Get effective timetable (original with modifications applied)
export function getEffectiveTimetable(): TimetableEntry[] {
  const modified = getModifiedTimetable();
  return modified.length > 0 ? modified : timetable;
}

// Cancel a period
export function cancelPeriod(
  day: string,
  period: number,
  modifiedBy: string,
  modifiedByName: string,
  reason?: string
): void {
  const currentTimetable = getEffectiveTimetable();
  const entryIndex = currentTimetable.findIndex(
    (e) => e.day === day && e.period === period
  );

  if (entryIndex === -1) return;

  const entry = currentTimetable[entryIndex];
  const originalSubjectId = entry.subjectId;
  const subject = entry.subjectId
    ? timetable.find((s) => s.day === day && s.period === period)?.subjectId
    : null;

  // Update the entry
  const updatedEntry: TimetableEntry = {
    ...entry,
    type: "cancelled",
    subjectId: null,
    isCancelled: true,
    modifiedBy,
    modifiedAt: new Date().toISOString(),
    modificationReason: reason || "Class cancelled",
  };

  const updatedTimetable = [...currentTimetable];
  updatedTimetable[entryIndex] = updatedEntry;
  saveModifiedTimetable(updatedTimetable);

  // Add to modification history
  const modification: TimetableModification = {
    id: `${day}-${period}-${Date.now()}`,
    day,
    period,
    originalSubjectId,
    newSubjectId: null,
    action: "cancelled",
    modifiedBy,
    modifiedByName,
    modifiedAt: new Date().toISOString(),
    reason: reason || "Class cancelled",
  };

  const modifications = getModifications();
  saveModifications([modification, ...modifications]);
}

// Assign substitute teacher
export function assignSubstitute(
  day: string,
  period: number,
  newTeacherId: string,
  modifiedBy: string,
  modifiedByName: string,
  reason?: string
): void {
  const currentTimetable = getEffectiveTimetable();
  const entryIndex = currentTimetable.findIndex(
    (e) => e.day === day && e.period === period
  );

  if (entryIndex === -1) return;

  const entry = currentTimetable[entryIndex];
  const originalTeacherId = entry.originalTeacherId || entry.substituteTeacherId;

  // Update the entry
  const updatedEntry: TimetableEntry = {
    ...entry,
    type: "substitute",
    originalTeacherId: originalTeacherId || entry.substituteTeacherId,
    substituteTeacherId: newTeacherId,
    modifiedBy,
    modifiedAt: new Date().toISOString(),
    modificationReason: reason || "Teacher substituted",
  };

  const updatedTimetable = [...currentTimetable];
  updatedTimetable[entryIndex] = updatedEntry;
  saveModifiedTimetable(updatedTimetable);

  // Add to modification history
  const modification: TimetableModification = {
    id: `${day}-${period}-${Date.now()}`,
    day,
    period,
    originalSubjectId: entry.subjectId,
    newSubjectId: entry.subjectId,
    originalTeacherId,
    newTeacherId,
    action: "substituted",
    modifiedBy,
    modifiedByName,
    modifiedAt: new Date().toISOString(),
    reason: reason || "Substitute teacher assigned",
  };

  const modifications = getModifications();
  saveModifications([modification, ...modifications]);
}

// Restore original schedule
export function restorePeriod(
  day: string,
  period: number,
  modifiedBy: string,
  modifiedByName: string
): void {
  const currentTimetable = getEffectiveTimetable();
  const entryIndex = currentTimetable.findIndex(
    (e) => e.day === day && e.period === period
  );

  if (entryIndex === -1) return;

  const originalEntry = timetable.find(
    (e) => e.day === day && e.period === period
  );

  if (!originalEntry) return;

  // Restore to original
  const updatedTimetable = [...currentTimetable];
  updatedTimetable[entryIndex] = {
    ...originalEntry,
  };
  saveModifiedTimetable(updatedTimetable);

  // Add to modification history
  const entry = currentTimetable[entryIndex];
  const modification: TimetableModification = {
    id: `${day}-${period}-${Date.now()}`,
    day,
    period,
    originalSubjectId: entry.subjectId,
    newSubjectId: originalEntry.subjectId,
    action: "assigned",
    modifiedBy,
    modifiedByName,
    modifiedAt: new Date().toISOString(),
    reason: "Restored to original schedule",
  };

  const modifications = getModifications();
  saveModifications([modification, ...modifications]);
}

// Check if a period is modified
export function isPeriodModified(day: string, period: number): boolean {
  const currentTimetable = getEffectiveTimetable();
  const entry = currentTimetable.find((e) => e.day === day && e.period === period);
  return entry ? entry.isCancelled || entry.type === "substitute" : false;
}

// Get modification history for a specific period
export function getPeriodModifications(
  day: string,
  period: number
): TimetableModification[] {
  const modifications = getModifications();
  return modifications.filter((m) => m.day === day && m.period === period);
}

// Clear all modifications (reset to original)
export function clearAllModifications(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MODIFICATIONS_KEY);
  localStorage.removeItem(MODIFIED_TIMETABLE_KEY);
}
