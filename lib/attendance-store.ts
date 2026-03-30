import { AttendanceRecord, AlertLog } from "./data";

// In-memory store for new attendance records (simulating database)
let newAttendanceRecords: AttendanceRecord[] = [];
let newAlertLogs: AlertLog[] = [];

export function addAttendanceRecord(record: Omit<AttendanceRecord, "id">): AttendanceRecord {
  const newRecord: AttendanceRecord = {
    ...record,
    id: `ATT${Date.now()}`,
  };
  newAttendanceRecords.push(newRecord);
  return newRecord;
}

export function addBulkAttendance(records: Omit<AttendanceRecord, "id">[]): AttendanceRecord[] {
  return records.map((record) => addAttendanceRecord(record));
}

export function getNewAttendanceRecords(): AttendanceRecord[] {
  return newAttendanceRecords;
}

export function addAlertLog(log: Omit<AlertLog, "id">): AlertLog {
  const newLog: AlertLog = {
    ...log,
    id: `AL${Date.now()}`,
  };
  newAlertLogs.push(newLog);
  return newLog;
}

export function getNewAlertLogs(): AlertLog[] {
  return newAlertLogs;
}

export function clearStore(): void {
  newAttendanceRecords = [];
  newAlertLogs = [];
}
