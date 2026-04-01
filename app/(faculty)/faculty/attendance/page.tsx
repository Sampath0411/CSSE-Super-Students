"use client";

import { useState, useMemo, useEffect } from "react";
import { students, subjects, teachers, ATTENDANCE_THRESHOLD, calculateStudentAttendance, timeSlots, type Student, type Subject, type TimetableEntry } from "@/lib/data";
import { addBulkAttendance } from "@/lib/attendance-store";
import { getEffectiveTimetable } from "@/lib/timetable-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X, Clock, Save, Users, BookOpen, Calendar, AlertTriangle, XCircle } from "lucide-react";

type AttendanceStatus = "present" | "absent" | "late";

interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
}

// Helper to get day name from date
function getDayName(dateStr: string): string {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const date = new Date(dateStr);
  return days[date.getDay()];
}

export default function AttendancePage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Map<string, AttendanceStatus>>(new Map());
  const [isSaved, setIsSaved] = useState(false);
  const [effectiveTimetable, setEffectiveTimetable] = useState<TimetableEntry[]>([]);

  // Load effective timetable on mount
  useEffect(() => {
    setEffectiveTimetable(getEffectiveTimetable());
  }, []);

  // Check for timetable modifications
  const timetableCheck = useMemo(() => {
    if (!selectedSubject || !selectedPeriod || !selectedDate) return null;

    const dayName = getDayName(selectedDate);
    const period = parseInt(selectedPeriod);

    const entry = effectiveTimetable.find(
      (e) => e.day === dayName && e.period === period
    );

    if (!entry) return { valid: false, message: "No class scheduled for this period" };

    if (entry.type === "cancelled" || entry.isCancelled) {
      return {
        valid: false,
        message: "This class has been cancelled",
        reason: entry.modificationReason
      };
    }

    if (entry.type === "substitute") {
      const substituteTeacher = entry.substituteTeacherId
        ? teachers.find((t) => t.id === entry.substituteTeacherId)
        : null;
      return {
        valid: true,
        isSubstitute: true,
        substituteTeacher,
        message: `Substitute teacher: ${substituteTeacher?.name || "Unknown"}`
      };
    }

    // Check if subject matches
    if (entry.subjectId !== selectedSubject) {
      const expectedSubject = subjects.find((s) => s.id === entry.subjectId);
      return {
        valid: false,
        message: `This period is scheduled for ${expectedSubject?.name || "another subject"}`,
      };
    }

    return { valid: true, isSubstitute: false };
  }, [selectedSubject, selectedPeriod, selectedDate, effectiveTimetable]);

  const selectedSubjectData = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubject);
  }, [selectedSubject]);

  const teacherName = useMemo(() => {
    if (!selectedSubjectData) return "";
    const teacher = teachers.find((t) => t.id === selectedSubjectData.teacherId);
    return teacher?.name || "";
  }, [selectedSubjectData]);

  const canMarkAttendance = timetableCheck?.valid === true;

  const studentsWithAttendance = useMemo(() => {
    return students.map((student) => {
      const attendanceData = calculateStudentAttendance(student.id, selectedSubject || undefined);
      return {
        ...student,
        attendancePercentage: attendanceData.percentage,
        isLowAttendance: attendanceData.percentage < ATTENDANCE_THRESHOLD,
      };
    });
  }, [selectedSubject]);

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => {
      const newMap = new Map(prev);
      newMap.set(studentId, status);
      return newMap;
    });
    setIsSaved(false);
  };

  const markAllPresent = () => {
    const newMap = new Map<string, AttendanceStatus>();
    students.forEach((s) => newMap.set(s.id, "present"));
    setAttendance(newMap);
    setIsSaved(false);
  };

  const markAllAbsent = () => {
    const newMap = new Map<string, AttendanceStatus>();
    students.forEach((s) => newMap.set(s.id, "absent"));
    setAttendance(newMap);
    setIsSaved(false);
  };

  const handleSave = () => {
    if (!selectedSubject || !selectedPeriod || attendance.size === 0) return;

    const records = Array.from(attendance.entries()).map(([studentId, status]) => ({
      studentId,
      subjectId: selectedSubject,
      date: selectedDate,
      period: parseInt(selectedPeriod),
      status,
      markedBy: selectedSubjectData?.teacherId || "",
    }));

    addBulkAttendance(records);
    setIsSaved(true);
  };

  const presentCount = Array.from(attendance.values()).filter((s) => s === "present").length;
  const absentCount = Array.from(attendance.values()).filter((s) => s === "absent").length;
  const lateCount = Array.from(attendance.values()).filter((s) => s === "late").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Digital Attendance Register</h1>
          <p className="text-muted-foreground mt-1">Mark attendance for your class quickly and efficiently</p>
        </div>

        {/* Selection Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              Session Details
            </CardTitle>
            <CardDescription>Select the subject, date, and period to mark attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
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
                <label className="text-sm font-medium text-foreground">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Period</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Period" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((period) => (
                      <SelectItem key={period} value={period.toString()}>
                        Period {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Faculty</label>
                <div className="h-9 flex items-center px-3 rounded-md bg-muted text-sm">
                  {teacherName || "Select a subject"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timetable Modification Alert */}
        {selectedSubject && selectedPeriod && timetableCheck && (
          <>
            {!timetableCheck.valid && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{timetableCheck.message}</span>
                    {timetableCheck.reason && (
                      <span className="text-sm">Reason: {timetableCheck.reason}</span>
                    )}
                    <span className="text-sm">Attendance cannot be marked for this period.</span>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            {timetableCheck.valid && timetableCheck.isSubstitute && (
              <Alert className="mb-6 bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  {timetableCheck.message}. This is a substitute class.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Quick Stats */}
        {canMarkAttendance && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold text-foreground">{students.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Present</p>
                    <p className="text-2xl font-bold text-success">{presentCount}</p>
                  </div>
                  <Check className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Absent</p>
                    <p className="text-2xl font-bold text-destructive">{absentCount}</p>
                  </div>
                  <X className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Late</p>
                    <p className="text-2xl font-bold text-warning">{lateCount}</p>
                  </div>
                  <Clock className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        {canMarkAttendance && (
          <div className="flex flex-wrap gap-3 mb-6">
            <Button onClick={markAllPresent} variant="outline" className="border-success text-success hover:bg-success hover:text-success-foreground">
              <Check className="h-4 w-4 mr-2" />
              Mark All Present
            </Button>
            <Button onClick={markAllAbsent} variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <X className="h-4 w-4 mr-2" />
              Mark All Absent
            </Button>
            <Button onClick={handleSave} disabled={attendance.size === 0} className="ml-auto">
              <Save className="h-4 w-4 mr-2" />
              {isSaved ? "Saved!" : "Save Attendance"}
            </Button>
          </div>
        )}

        {/* Cannot mark attendance message */}
        {selectedSubject && selectedPeriod && !canMarkAttendance && timetableCheck && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="py-8 text-center">
              <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">Attendance Disabled</h3>
              <p className="text-red-600">{timetableCheck.message}</p>
              {timetableCheck.reason && (
                <p className="text-sm text-red-500 mt-2">Reason: {timetableCheck.reason}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Student List */}
        {canMarkAttendance ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Student Attendance
              </CardTitle>
              <CardDescription>
                Click on a status button to mark attendance. Students with attendance below {ATTENDANCE_THRESHOLD}% are highlighted in red.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Roll No</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Current %</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsWithAttendance.map((student) => {
                      const currentStatus = attendance.get(student.id);
                      return (
                        <tr
                          key={student.id}
                          className={`border-b border-border hover:bg-muted/50 transition-colors ${
                            student.isLowAttendance ? "bg-destructive/10" : ""
                          }`}
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm text-foreground">{student.rollNumber}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{student.name}</span>
                              {student.isLowAttendance && (
                                <Badge variant="destructive" className="text-xs">
                                  Low Attendance
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`font-semibold ${
                                student.isLowAttendance ? "text-destructive" : "text-success"
                              }`}
                            >
                              {student.attendancePercentage}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant={currentStatus === "present" ? "default" : "outline"}
                                className={currentStatus === "present" ? "bg-success text-success-foreground hover:bg-success/90" : ""}
                                onClick={() => handleAttendanceChange(student.id, "present")}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={currentStatus === "absent" ? "default" : "outline"}
                                className={currentStatus === "absent" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                                onClick={() => handleAttendanceChange(student.id, "absent")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={currentStatus === "late" ? "default" : "outline"}
                                className={currentStatus === "late" ? "bg-warning text-warning-foreground hover:bg-warning/90" : ""}
                                onClick={() => handleAttendanceChange(student.id, "late")}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Select Session Details</h3>
              <p className="text-muted-foreground">Please select a subject and period to start marking attendance</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
