"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClipboardCheck,
  CalendarDays,
  BookOpen,
  CheckCircle,
  XCircle,
  Filter,
  TrendingUp,
} from "lucide-react";
import {
  type Student,
  subjects,
  attendanceRecords,
  type AttendanceRecord,
  ATTENDANCE_THRESHOLD,
} from "@/lib/data";

export default function StudentAttendancePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [studentRecords, setStudentRecords] = useState<AttendanceRecord[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  useEffect(() => {
    const storedStudent = sessionStorage.getItem("studentUser");
    if (storedStudent) {
      const parsedStudent = JSON.parse(storedStudent);
      setStudent(parsedStudent);

      const records = attendanceRecords.filter(
        (r) => r.studentId === parsedStudent.id
      );
      setStudentRecords(records);
    }
  }, []);

  // Get unique months from records
  const months = Array.from(
    new Set(
      studentRecords.map((r) => {
        const date = new Date(r.date);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      })
    )
  ).sort();

  // Filter records
  const filteredRecords = studentRecords.filter((record) => {
    const matchSubject =
      selectedSubject === "all" || record.subjectId === selectedSubject;
    const matchMonth =
      selectedMonth === "all" ||
      record.date.startsWith(selectedMonth);
    return matchSubject && matchMonth;
  });

  // Group by date
  const groupedByDate = filteredRecords.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  const sortedDates = Object.keys(groupedByDate).sort().reverse();

  // Calculate subject-wise stats
  const subjectStats = subjects.map((subject) => {
    const subjectRecords = studentRecords.filter(
      (r) => r.subjectId === subject.id
    );
    const present = subjectRecords.filter((r) => r.status === "present").length;
    const total = subjectRecords.length;
    return {
      ...subject,
      present,
      absent: total - present,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
      "en-US",
      { month: "long", year: "numeric" }
    );
  };

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
          <ClipboardCheck className="h-6 w-6" />
          My Attendance
        </h1>
        <p className="text-muted-foreground mt-1">
          View your attendance records and statistics
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Subject Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectStats.map((subject) => (
              <Card key={subject.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      {subject.code}
                    </CardTitle>
                    <Badge
                      variant={
                        subject.percentage >= ATTENDANCE_THRESHOLD
                          ? "default"
                          : "destructive"
                      }
                    >
                      {subject.percentage}%
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {subject.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
                    <div
                      className={`h-full transition-all ${
                        subject.percentage >= ATTENDANCE_THRESHOLD
                          ? "bg-success"
                          : "bg-destructive"
                      }`}
                      style={{ width: `${subject.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-success">
                      <CheckCircle className="h-4 w-4" />
                      <span>{subject.present} Present</span>
                    </div>
                    <div className="flex items-center gap-1 text-destructive">
                      <XCircle className="h-4 w-4" />
                      <span>{subject.absent} Absent</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">Absent</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Percentage</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectStats.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{subject.code}</p>
                            <p className="text-xs text-muted-foreground">
                              {subject.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-success">
                          {subject.present}
                        </TableCell>
                        <TableCell className="text-center text-destructive">
                          {subject.absent}
                        </TableCell>
                        <TableCell className="text-center">
                          {subject.total}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-medium ${
                              subject.percentage >= ATTENDANCE_THRESHOLD
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            {subject.percentage}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              subject.percentage >= ATTENDANCE_THRESHOLD
                                ? "outline"
                                : "destructive"
                            }
                          >
                            {subject.percentage >= ATTENDANCE_THRESHOLD
                              ? "OK"
                              : "Low"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1.5 block">
                    <Filter className="h-4 w-4 inline mr-1" />
                    Filter by Subject
                  </label>
                  <Select
                    value={selectedSubject}
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.code} - {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1.5 block">
                    <CalendarDays className="h-4 w-4 inline mr-1" />
                    Filter by Month
                  </label>
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {formatMonthLabel(month)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSubject("all");
                      setSelectedMonth("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <div className="space-y-4">
            {sortedDates.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No attendance records found</p>
                </CardContent>
              </Card>
            ) : (
              sortedDates.map((date) => (
                <Card key={date}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(date)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {groupedByDate[date]
                        .sort((a, b) => a.period - b.period)
                        .map((record) => {
                          const subject = subjects.find(
                            (s) => s.id === record.subjectId
                          );
                          return (
                            <div
                              key={record.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-bold text-primary">
                                    P{record.period}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {subject?.name || "Unknown"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {subject?.code}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  record.status === "present"
                                    ? "default"
                                    : "destructive"
                                }
                                className="flex items-center gap-1"
                              >
                                {record.status === "present" ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                {record.status === "present"
                                  ? "Present"
                                  : "Absent"}
                              </Badge>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
