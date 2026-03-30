"use client";

import { useState, useMemo } from "react";
import {
  students,
  subjects,
  teachers,
  attendanceRecords,
  alertLogs,
  ATTENDANCE_THRESHOLD,
  calculateStudentAttendance,
  getAbsenteesForDate,
  getChronicAbsentees,
  getStudentById,
  getSubjectById,
} from "@/lib/data";
import { addAlertLog } from "@/lib/attendance-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  AlertTriangle,
  TrendingDown,
  Calendar,
  BookOpen,
  Send,
  Mail,
  MessageSquare,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const COLORS = ["oklch(0.55 0.18 160)", "oklch(0.55 0.22 25)", "oklch(0.75 0.15 70)", "oklch(0.45 0.15 250)"];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<string>("2024-03-15");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [viewMode, setViewMode] = useState<"day" | "subject" | "semester">("day");

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalStudents = students.length;
    const chronicAbsentees = getChronicAbsentees(ATTENDANCE_THRESHOLD);
    const avgAttendance = students.reduce((acc, student) => {
      return acc + calculateStudentAttendance(student.id).percentage;
    }, 0) / students.length;

    return {
      totalStudents,
      chronicAbsentees: chronicAbsentees.length,
      avgAttendance: Math.round(avgAttendance),
      totalAlerts: alertLogs.length,
    };
  }, []);

  // Day-wise absentees
  const dayAbsentees = useMemo(() => {
    return getAbsenteesForDate(selectedDate);
  }, [selectedDate]);

  // Subject-wise attendance data
  const subjectAttendanceData = useMemo(() => {
    return subjects.map((subject) => {
      const subjectRecords = attendanceRecords.filter((r) => r.subjectId === subject.id);
      const presentCount = subjectRecords.filter((r) => r.status === "present").length;
      const totalCount = subjectRecords.length;
      const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

      return {
        name: subject.code,
        fullName: subject.name,
        attendance: percentage,
        present: presentCount,
        absent: totalCount - presentCount,
      };
    });
  }, []);

  // Student attendance breakdown for selected subject
  const studentSubjectAttendance = useMemo(() => {
    if (!selectedSubject) return [];

    return students.map((student) => {
      const attendance = calculateStudentAttendance(student.id, selectedSubject);
      return {
        name: student.name.split(" ")[0],
        rollNumber: student.rollNumber,
        fullName: student.name,
        percentage: attendance.percentage,
        present: attendance.present,
        total: attendance.total,
        isLow: attendance.percentage < ATTENDANCE_THRESHOLD,
      };
    });
  }, [selectedSubject]);

  // Chronic absentees list
  const chronicAbsenteesList = useMemo(() => {
    return getChronicAbsentees(ATTENDANCE_THRESHOLD);
  }, []);

  // Attendance trend data (last 10 days simulation)
  const attendanceTrendData = useMemo(() => {
    const dates = [];
    const startDate = new Date("2024-03-01");
    for (let i = 0; i < 15; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const dateStr = date.toISOString().split("T")[0];
        const dayRecords = attendanceRecords.filter((r) => r.date === dateStr);
        const presentCount = dayRecords.filter((r) => r.status === "present").length;
        const percentage = dayRecords.length > 0 ? Math.round((presentCount / dayRecords.length) * 100) : 0;

        dates.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          attendance: percentage,
        });
      }
    }
    return dates;
  }, []);

  // Attendance distribution for pie chart
  const attendanceDistribution = useMemo(() => {
    const excellent = students.filter((s) => calculateStudentAttendance(s.id).percentage >= 90).length;
    const good = students.filter((s) => {
      const p = calculateStudentAttendance(s.id).percentage;
      return p >= 75 && p < 90;
    }).length;
    const average = students.filter((s) => {
      const p = calculateStudentAttendance(s.id).percentage;
      return p >= 60 && p < 75;
    }).length;
    const poor = students.filter((s) => calculateStudentAttendance(s.id).percentage < 60).length;

    return [
      { name: "Excellent (90%+)", value: excellent },
      { name: "Good (75-90%)", value: good },
      { name: "Average (60-75%)", value: average },
      { name: "Poor (<60%)", value: poor },
    ];
  }, []);

  const handleSendAlert = (studentId: string, type: "sms" | "email") => {
    const student = getStudentById(studentId);
    if (!student) return;

    const attendance = calculateStudentAttendance(studentId);
    const message = `Alert: Your ward ${student.name} has attendance of ${attendance.percentage}% which is below the required ${ATTENDANCE_THRESHOLD}%. Please contact the department.`;

    addAlertLog({
      studentId,
      type,
      message,
      sentAt: new Date().toISOString(),
      parentContact: type === "sms" ? student.parentPhone : `${student.name.toLowerCase().replace(" ", ".")}@parent.com`,
    });

    alert(`${type.toUpperCase()} alert sent for ${student.name}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Multi-dimensional attendance reporting and alert management
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold text-foreground">{overallStats.totalStudents}</p>
                </div>
                <Users className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Attendance</p>
                  <p className="text-3xl font-bold text-success">{overallStats.avgAttendance}%</p>
                </div>
                <BarChart3 className="h-10 w-10 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Chronic Absentees</p>
                  <p className="text-3xl font-bold text-destructive">{overallStats.chronicAbsentees}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alerts Sent</p>
                  <p className="text-3xl font-bold text-warning">{overallStats.totalAlerts}</p>
                </div>
                <Send className="h-10 w-10 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="day" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="day" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Day-wise
            </TabsTrigger>
            <TabsTrigger value="subject" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Subject-wise
            </TabsTrigger>
            <TabsTrigger value="semester" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Semester
            </TabsTrigger>
          </TabsList>

          {/* Day-wise Tab */}
          <TabsContent value="day" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Absentee Report</CardTitle>
                <CardDescription>View students who were absent on a specific date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Select Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                {dayAbsentees.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Roll No</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Missed Periods</th>
                          <th className="text-center py-3 px-4 font-medium text-muted-foreground">Overall %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayAbsentees.map(({ student, records }) => {
                          const attendance = calculateStudentAttendance(student.id);
                          return (
                            <tr key={student.id} className="border-b border-border hover:bg-muted/50">
                              <td className="py-3 px-4 font-mono text-sm text-foreground">{student.rollNumber}</td>
                              <td className="py-3 px-4 font-medium text-foreground">{student.name}</td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {records.map((r) => {
                                    const subject = getSubjectById(r.subjectId);
                                    return (
                                      <Badge key={r.id} variant="secondary" className="text-xs">
                                        P{r.period}: {subject?.code}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`font-semibold ${
                                    attendance.percentage < ATTENDANCE_THRESHOLD
                                      ? "text-destructive"
                                      : "text-success"
                                  }`}
                                >
                                  {attendance.percentage}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No absentees found for the selected date
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attendance Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Trend</CardTitle>
                <CardDescription>Daily attendance percentage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="attendance"
                        stroke="oklch(0.45 0.15 250)"
                        strokeWidth={2}
                        dot={{ fill: "oklch(0.45 0.15 250)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subject-wise Tab */}
          <TabsContent value="subject" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subject-wise Attendance</CardTitle>
                  <CardDescription>Attendance percentage across all subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subjectAttendanceData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis type="number" domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={12} width={60} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                          }}
                          formatter={(value: number, name: string, props: { payload: { fullName: string } }) => [
                            `${value}%`,
                            props.payload.fullName,
                          ]}
                        />
                        <Bar dataKey="attendance" fill="oklch(0.55 0.18 160)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Distribution</CardTitle>
                  <CardDescription>Students categorized by attendance percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={attendanceDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}
                        >
                          {attendanceDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                          }}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subject Detail View */}
            <Card>
              <CardHeader>
                <CardTitle>Student Attendance by Subject</CardTitle>
                <CardDescription>Select a subject to view individual student attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full md:w-[300px]">
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

                {selectedSubject && studentSubjectAttendance.length > 0 && (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentSubjectAttendance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                          }}
                          formatter={(value: number, name: string, props: { payload: { fullName: string; present: number; total: number } }) => [
                            `${value}% (${props.payload.present}/${props.payload.total})`,
                            props.payload.fullName,
                          ]}
                        />
                        <Bar
                          dataKey="percentage"
                          fill="oklch(0.45 0.15 250)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Semester Tab - Chronic Absentees & Alerts */}
          <TabsContent value="semester" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Chronic Absentees - Exam Eligibility at Risk
                </CardTitle>
                <CardDescription>
                  Students with attendance below {ATTENDANCE_THRESHOLD}% - Not eligible for exams without condonation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chronicAbsenteesList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Roll No</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                          <th className="text-center py-3 px-4 font-medium text-muted-foreground">Attendance</th>
                          <th className="text-center py-3 px-4 font-medium text-muted-foreground">Classes</th>
                          <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                          <th className="text-center py-3 px-4 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chronicAbsenteesList.map(({ student, attendance }) => (
                          <tr key={student.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4 font-mono text-sm text-foreground">{student.rollNumber}</td>
                            <td className="py-3 px-4 font-medium text-foreground">{student.name}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-bold text-destructive">{attendance.percentage}%</span>
                            </td>
                            <td className="py-3 px-4 text-center text-muted-foreground">
                              {attendance.present}/{attendance.total}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant="destructive">Not Eligible</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendAlert(student.id, "sms")}
                                  title="Send SMS Alert"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendAlert(student.id, "email")}
                                  title="Send Email Alert"
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No chronic absentees found. All students have attendance above {ATTENDANCE_THRESHOLD}%.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alert History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Alert History
                </CardTitle>
                <CardDescription>Log of SMS and Email alerts sent to parents</CardDescription>
              </CardHeader>
              <CardContent>
                {alertLogs.length > 0 ? (
                  <div className="space-y-4">
                    {alertLogs.map((log) => {
                      const student = getStudentById(log.studentId);
                      return (
                        <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                          <div
                            className={`p-2 rounded-full ${
                              log.type === "sms" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                            }`}
                          >
                            {log.type === "sms" ? (
                              <MessageSquare className="h-4 w-4" />
                            ) : (
                              <Mail className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">{student?.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {log.type.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{log.message}</p>
                            <p className="text-xs text-muted-foreground">
                              Sent to: {log.parentContact} | {new Date(log.sentAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No alerts have been sent yet</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
