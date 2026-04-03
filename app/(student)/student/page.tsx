"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  GraduationCap,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Shield,
} from "lucide-react";
import {
  type Student,
  subjects,
  attendanceRecords,
  timetable,
  timeSlots,
  calculateStudentAttendance,
  ATTENDANCE_THRESHOLD,
} from "@/lib/data";

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [overallAttendance, setOverallAttendance] = useState<{
    total: number;
    present: number;
    percentage: number;
  } | null>(null);
  const [subjectAttendance, setSubjectAttendance] = useState<
    Array<{
      subjectId: string;
      subjectName: string;
      total: number;
      present: number;
      percentage: number;
    }>
  >([]);

  useEffect(() => {
    const storedStudent = sessionStorage.getItem("studentUser");
    if (storedStudent) {
      const parsedStudent = JSON.parse(storedStudent);
      setStudent(parsedStudent);

      // Calculate overall attendance
      const overall = calculateStudentAttendance(parsedStudent.id);
      setOverallAttendance(overall);

      // Calculate subject-wise attendance
      const studentRecords = attendanceRecords.filter(
        (r) => r.studentId === parsedStudent.id
      );
      
      const subjectStats = subjects.map((subject) => {
        const subjectRecords = studentRecords.filter(
          (r) => r.subjectId === subject.id
        );
        const present = subjectRecords.filter((r) => r.status === "present").length;
        const total = subjectRecords.length;
        return {
          subjectId: subject.id,
          subjectName: subject.name,
          total,
          present,
          percentage: total > 0 ? Math.round((present / total) * 100) : 0,
        };
      });

      setSubjectAttendance(subjectStats);
    }
  }, []);

  // Get today's timetable
  const getTodaySchedule = () => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const today = days[new Date().getDay()];
    return timetable
      .filter((t) => t.day === today && t.subjectId !== null)
      .sort((a, b) => a.period - b.period)
      .map((entry) => {
        const subject = subjects.find((s) => s.id === entry.subjectId);
        const timeSlot = timeSlots.find((t) => t.period === entry.period);
        return {
          ...entry,
          subjectName: subject?.name || "Unknown",
          subjectCode: subject?.code || "",
          time: timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : "",
        };
      });
  };

  const todaySchedule = getTodaySchedule();

  if (!student || !overallAttendance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const lowAttendanceSubjects = subjectAttendance.filter(
    (s) => s.percentage < ATTENDANCE_THRESHOLD
  );
  const isEligible = overallAttendance.percentage >= ATTENDANCE_THRESHOLD;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border border-primary/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {student.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {student.course} - {student.year}rd Year, Semester {student.semester}
            </p>
          </div>
          {/* <Button asChild size="lg" variant="secondary">
            <Link href="/student/verify-attendance">
              <Shield className="h-5 w-5 mr-2" />
              Verify Attendance
            </Link>
          </Button> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Attendance</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {overallAttendance.percentage}%
                </p>
              </div>
              <div
                className={`p-3 rounded-xl ${
                  isEligible ? "bg-success/10" : "bg-destructive/10"
                }`}
              >
                {isEligible ? (
                  <TrendingUp className="h-6 w-6 text-success" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-destructive" />
                )}
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isEligible ? "bg-success" : "bg-destructive"
                }`}
                style={{ width: `${overallAttendance.percentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Classes Attended</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {overallAttendance.present}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" />
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
                <p className="text-3xl font-bold text-foreground mt-1">
                  {overallAttendance.total - overallAttendance.present}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10">
                <CalendarDays className="h-6 w-6 text-warning" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exam Eligibility</p>
                <Badge
                  variant={isEligible ? "default" : "destructive"}
                  className="mt-2 text-sm"
                >
                  {isEligible ? "Eligible" : "At Risk"}
                </Badge>
              </div>
              <div
                className={`p-3 rounded-xl ${
                  isEligible ? "bg-success/10" : "bg-destructive/10"
                }`}
              >
                <GraduationCap
                  className={`h-6 w-6 ${
                    isEligible ? "text-success" : "text-destructive"
                  }`}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Minimum {ATTENDANCE_THRESHOLD}% required
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today&apos;s Schedule
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No classes scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        P{entry.period}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {entry.subjectName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {entry.subjectCode} | {entry.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subject-wise Attendance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Subject Attendance
                </CardTitle>
                <CardDescription>Your attendance by subject</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/student/attendance">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subjectAttendance.slice(0, 5).map((subject) => (
                <div key={subject.subjectId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{subject.subjectName}</span>
                    <span
                      className={`font-medium ${
                        subject.percentage >= ATTENDANCE_THRESHOLD
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {subject.percentage}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        subject.percentage >= ATTENDANCE_THRESHOLD
                          ? "bg-success"
                          : "bg-destructive"
                      }`}
                      style={{ width: `${subject.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Attendance Warning */}
      {lowAttendanceSubjects.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Attendance Warning
            </CardTitle>
            <CardDescription>
              You have low attendance in the following subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowAttendanceSubjects.map((subject) => (
                <div
                  key={subject.subjectId}
                  className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {subject.subjectName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {subject.present}/{subject.total} classes
                    </p>
                  </div>
                  <Badge variant="destructive">{subject.percentage}%</Badge>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              You need at least {ATTENDANCE_THRESHOLD}% attendance in each subject to be eligible for exams.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
