"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  Hash,
  Building2,
  Mail,
  Clock,
} from "lucide-react";
import {
  type Student,
  subjects,
  attendanceRecords,
  calculateStudentAttendance,
  ATTENDANCE_THRESHOLD,
} from "@/lib/data";

export default function StudentProfilePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [overallAttendance, setOverallAttendance] = useState<{
    total: number;
    present: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    const storedStudent = sessionStorage.getItem("studentUser");
    if (storedStudent) {
      const parsedStudent = JSON.parse(storedStudent);
      setStudent(parsedStudent);
      const overall = calculateStudentAttendance(parsedStudent.id);
      setOverallAttendance(overall);
    }
  }, []);

  if (!student || !overallAttendance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const isEligible = overallAttendance.percentage >= ATTENDANCE_THRESHOLD;

  // Count subjects with low attendance
  const subjectStats = subjects.map((subject) => {
    const subjectRecords = attendanceRecords.filter(
      (r) => r.studentId === student.id && r.subjectId === subject.id
    );
    const present = subjectRecords.filter((r) => r.status === "present").length;
    const total = subjectRecords.length;
    return {
      ...subject,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  });

  const lowAttendanceCount = subjectStats.filter(
    (s) => s.percentage < ATTENDANCE_THRESHOLD
  ).length;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="h-6 w-6" />
          My Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          View your student information and academic details
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{student.name}</CardTitle>
              <CardDescription className="text-base mt-1">
                {student.course}
              </CardDescription>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary">{student.year}rd Year</Badge>
                <Badge variant="secondary">Semester {student.semester}</Badge>
                <Badge
                  variant={isEligible ? "default" : "destructive"}
                >
                  {isEligible ? "Exam Eligible" : "At Risk"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Student Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Hash className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registration Number</p>
                <p className="font-medium">{student.regdNo}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Roll Number</p>
                <p className="font-medium">{student.rollNumber}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">Computer Science & Systems Engineering</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Academic Year</p>
                <p className="font-medium">2025-2026</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Attendance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 rounded-lg bg-muted/50">
              <p className="text-4xl font-bold text-foreground">
                {overallAttendance.percentage}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Overall Attendance
              </p>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isEligible ? "bg-success" : "bg-destructive"
                  }`}
                  style={{ width: `${overallAttendance.percentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-success/10">
                <p className="text-2xl font-bold text-success">
                  {overallAttendance.present}
                </p>
                <p className="text-sm text-muted-foreground">Classes Attended</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-destructive/10">
                <p className="text-2xl font-bold text-destructive">
                  {overallAttendance.total - overallAttendance.present}
                </p>
                <p className="text-sm text-muted-foreground">Classes Missed</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Classes</span>
              <span className="font-medium">{overallAttendance.total}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subjects with Low Attendance</span>
              <Badge variant={lowAttendanceCount > 0 ? "destructive" : "outline"}>
                {lowAttendanceCount}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Minimum Required</span>
              <span className="font-medium">{ATTENDANCE_THRESHOLD}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Class Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Class</p>
              <p className="font-medium">3/6 BTECH (CSE)-4</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Room</p>
              <p className="font-medium">A33</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Semester Start</p>
              <p className="font-medium">19 Jan 2026</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Total Subjects</p>
              <p className="font-medium">{subjects.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Enrolled Subjects
          </CardTitle>
          <CardDescription>
            Your subjects for this semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjectStats.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div>
                  <p className="font-medium text-sm">{subject.code}</p>
                  <p className="text-xs text-muted-foreground">{subject.name}</p>
                </div>
                <Badge
                  variant={
                    subject.percentage >= ATTENDANCE_THRESHOLD
                      ? "outline"
                      : "destructive"
                  }
                >
                  {subject.percentage}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
