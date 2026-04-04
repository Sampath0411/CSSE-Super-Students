"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle2, XCircle, Clock, BookOpen, TrendingUp, AlertTriangle } from "lucide-react";
import {
  type Student,
  subjects,
  attendanceRecords,
  calculateStudentAttendance,
  ATTENDANCE_THRESHOLD,
  timeSlots
} from "@/lib/data";

export default function StudentAttendancePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [subjectAttendance, setSubjectAttendance] = useState<
    Array<{
      subjectId: string;
      subjectName: string;
      subjectCode: string;
      total: number;
      present: number;
      absent: number;
      percentage: number;
    }>
  >([]);
  const [recentRecords, setRecentRecords] = useState<
    Array<{
      date: string;
      subjectName: string;
      subjectCode: string;
      period: number;
      time: string;
      status: "present" | "absent";
    }>
  >([]);

  useEffect(() => {
    const storedStudent = sessionStorage.getItem("studentUser");
    if (storedStudent) {
      const parsedStudent: Student = JSON.parse(storedStudent);
      setStudent(parsedStudent);

      // Calculate subject-wise attendance
      const subjectStats = subjects.map((subject) => {
        const attendance = calculateStudentAttendance(parsedStudent.id, subject.id);
        return {
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: subject.code,
          total: attendance.total,
          present: attendance.present,
          absent: attendance.total - attendance.present,
          percentage: attendance.percentage,
        };
      });
      setSubjectAttendance(subjectStats);

      // Get recent attendance records
      const studentRecords = attendanceRecords
        .filter((r) => r.studentId === parsedStudent.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 20);

      const recent = studentRecords.map((record) => {
        const subject = subjects.find((s) => s.id === record.subjectId);
        const timeSlot = timeSlots.find((t) => t.period === record.period);
        return {
          date: record.date,
          subjectName: subject?.name || "Unknown",
          subjectCode: subject?.code || "",
          period: record.period,
          time: timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : "",
          status: record.status,
        };
      });
      setRecentRecords(recent);
    }
  }, []);

  const overallAttendance = student
    ? calculateStudentAttendance(student.id)
    : { total: 0, present: 0, percentage: 0 };

  const isEligible = overallAttendance.percentage >= ATTENDANCE_THRESHOLD;
  const lowAttendanceSubjects = subjectAttendance.filter(
    (s) => s.percentage < ATTENDANCE_THRESHOLD && s.total > 0
  );

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          My Attendance
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your attendance across all subjects
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Attendance</p>
                <p className={`text-3xl font-bold ${isEligible ? "text-success" : "text-destructive"}`}>
                  {overallAttendance.percentage}%
                </p>
              </div>
              <div className={`p-3 rounded-xl ${isEligible ? "bg-success/10" : "bg-destructive/10"}`}>
                <TrendingUp className={`h-6 w-6 ${isEligible ? "text-success" : "text-destructive"}`} />
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all ${isEligible ? "bg-success" : "bg-destructive"}`}
                style={{ width: `${Math.min(overallAttendance.percentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Classes Attended</p>
                <p className="text-3xl font-bold text-foreground">{overallAttendance.present}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Out of {overallAttendance.total} total classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Classes Missed</p>
                <p className="text-3xl font-bold text-foreground">
                  {overallAttendance.total - overallAttendance.present}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10">
                <XCircle className="h-6 w-6 text-warning" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exam Eligibility</p>
                <Badge
                  variant={isEligible ? "default" : "destructive"}
                  className="mt-2"
                >
                  {isEligible ? "Eligible" : "At Risk"}
                </Badge>
              </div>
              <div className={`p-3 rounded-xl ${isEligible ? "bg-success/10" : "bg-destructive/10"}`}>
                <BookOpen className={`h-6 w-6 ${isEligible ? "text-success" : "text-destructive"}`} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Min {ATTENDANCE_THRESHOLD}% required
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Attendance Warning */}
      {lowAttendanceSubjects.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Low Attendance Alert
            </CardTitle>
            <CardDescription>
              You have low attendance in the following subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {lowAttendanceSubjects.map((subject) => (
                <div
                  key={subject.subjectId}
                  className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">{subject.subjectName}</p>
                    <p className="text-xs text-muted-foreground">
                      {subject.present}/{subject.total} classes
                    </p>
                  </div>
                  <Badge variant="destructive">{subject.percentage}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="subjects" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subjects">Subject-wise</TabsTrigger>
          <TabsTrigger value="recent">Recent Records</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance by Subject</CardTitle>
              <CardDescription>Your attendance percentage for each subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectAttendance.map((subject) => (
                  <div key={subject.subjectId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{subject.subjectName}</span>
                        <Badge variant="secondary" className="text-xs">{subject.subjectCode}</Badge>
                      </div>
                      <span
                        className={`font-semibold text-sm ${
                          subject.percentage >= ATTENDANCE_THRESHOLD
                            ? "text-success"
                            : subject.total > 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {subject.total > 0 ? `${subject.percentage}%` : "No data"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          subject.percentage >= ATTENDANCE_THRESHOLD
                            ? "bg-success"
                            : subject.total > 0
                            ? "bg-destructive"
                            : "bg-muted-foreground"
                        }`}
                        style={{ width: `${Math.min(subject.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Present: {subject.present}</span>
                      <span>Absent: {subject.absent}</span>
                      <span>Total: {subject.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance Records</CardTitle>
              <CardDescription>Your last 20 attendance entries</CardDescription>
            </CardHeader>
            <CardContent>
              {recentRecords.length > 0 ? (
                <div className="space-y-2">
                  {recentRecords.map((record, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {record.status === "present" ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{record.subjectName}</p>
                          <p className="text-xs text-muted-foreground">
                            {record.subjectCode} • Period {record.period}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(record.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {record.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No attendance records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
