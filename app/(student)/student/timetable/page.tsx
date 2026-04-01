"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, BookOpen, MapPin, Bell, AlertCircle, Users, XCircle } from "lucide-react";
import { timetable, subjects, teachers, timeSlots, type Student } from "@/lib/data";
import { getEffectiveTimetable, getModifications, type TimetableModification } from "@/lib/timetable-store";

const days = [
  { id: "MON", label: "Monday" },
  { id: "TUE", label: "Tuesday" },
  { id: "WED", label: "Wednesday" },
  { id: "THU", label: "Thursday" },
  { id: "FRI", label: "Friday" },
  { id: "SAT", label: "Saturday" },
];

const typeColors: Record<string, string> = {
  class: "bg-blue-100 text-blue-800 border-blue-200",
  lab: "bg-purple-100 text-purple-800 border-purple-200",
  break: "bg-gray-100 text-gray-800 border-gray-200",
  "ncc/nss": "bg-green-100 text-green-800 border-green-200",
  "self-study": "bg-yellow-100 text-yellow-800 border-yellow-200",
  remedial: "bg-orange-100 text-orange-800 border-orange-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  substitute: "bg-amber-100 text-amber-800 border-amber-200",
};

const typeLabels: Record<string, string> = {
  class: "Theory",
  lab: "Lab",
  break: "Break",
  "ncc/nss": "NCC/NSS",
  "self-study": "Self Study",
  remedial: "Remedial",
  cancelled: "Cancelled",
  substitute: "Substitute",
};

export default function StudentTimetablePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [today, setToday] = useState("")
  const [effectiveTimetable, setEffectiveTimetable] = useState(timetable);
  const [modifications, setModifications] = useState<TimetableModification[]>([]);

  useEffect(() => {
    const storedStudent = sessionStorage.getItem("studentUser");
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    }

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const todayIndex = new Date().getDay();
    setToday(days[todayIndex]);

    // Load modified timetable
    setEffectiveTimetable(getEffectiveTimetable());
    setModifications(getModifications());
  }, []);

  const getTimetableForDay = (day: string) => {
    return effectiveTimetable
      .filter((entry) => entry.day === day)
      .sort((a, b) => a.period - b.period);
  };

  const getSubjectInfo = (subjectId: string | null) => {
    if (!subjectId) return null;
    return subjects.find((s) => s.id === subjectId);
  };

  const getTeacherInfo = (teacherId: string | null) => {
    if (!teacherId) return null;
    return teachers.find((t) => t.id === teacherId);
  };

  const getTimeSlot = (period: number) => {
    return timeSlots.find((t) => t.period === period);
  };

  // Get modifications for a specific period
  const getPeriodModification = (day: string, period: number) => {
    return modifications.find(m => m.day === day && m.period === period);
  };

  const renderPeriod = (entry: any) => {
    const timeSlot = getTimeSlot(entry.period);
    const subject = getSubjectInfo(entry.subjectId);
    const originalTeacher = entry.originalTeacherId
      ? getTeacherInfo(entry.originalTeacherId)
      : subject ? getTeacherInfo(subject.teacherId) : null;
    const substituteTeacher = entry.substituteTeacherId
      ? getTeacherInfo(entry.substituteTeacherId)
      : null;

    const isCancelled = entry.type === "cancelled" || entry.isCancelled;
    const isSubstitute = entry.type === "substitute";
    const modification = getPeriodModification(entry.day, entry.period);

    return (
      <div
        key={`${entry.day}-${entry.period}`}
        className={`p-4 rounded-lg border ${
          isCancelled
            ? "bg-red-50 border-red-200"
            : isSubstitute
            ? "bg-amber-50 border-amber-200"
            : entry.subjectId
            ? "bg-card"
            : "bg-muted/50"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-primary">P{entry.period}</span>
              <span className="text-sm text-muted-foreground">
                {timeSlot?.startTime} - {timeSlot?.endTime}
              </span>
              {modification && (
                <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                  Modified
                </Badge>
              )}
            </div>

            {entry.subjectId && !isCancelled ? (
              <>
                <h4 className="font-semibold text-foreground">{subject?.name}</h4>
                <p className="text-sm text-muted-foreground">{subject?.code}</p>
                {isSubstitute && substituteTeacher ? (
                  <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                    <p className="text-sm">
                      <span className="text-amber-700 font-medium">Substitute: </span>
                      <span className="text-amber-900">{substituteTeacher.name}</span>
                    </p>
                    {originalTeacher && (
                      <p className="text-xs text-amber-600">
                        (Original: {originalTeacher.name})
                      </p>
                    )}
                  </div>
                ) : originalTeacher ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    Faculty: {originalTeacher.name}
                  </p>
                ) : null}
              </>
            ) : isCancelled ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <p className="text-red-700 font-medium line-through">
                    {subject?.name || typeLabels[entry.type]}
                  </p>
                </div>
                {entry.modificationReason && (
                  <p className="text-xs text-red-600 ml-6">
                    Reason: {entry.modificationReason}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground font-medium">{typeLabels[entry.type]}</p>
            )}
          </div>

          <Badge variant="outline" className={`${typeColors[entry.type]} capitalize`}>
            {typeLabels[entry.type]}
          </Badge>
        </div>
      </div>
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
          <Calendar className="h-6 w-6" />
          My Timetable
        </h1>
        <p className="text-muted-foreground mt-1">
          {student.course} - Year {student.year}, Semester {student.semester}
        </p>
      </div>

      {/* Today's Schedule Alert */}
      {today && today !== "SUN" && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Today&apos;s Schedule</p>
                <p className="text-sm text-muted-foreground">
                  You have {getTimetableForDay(today).filter(e => e.subjectId && e.type !== "cancelled").length} classes today
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modification Alert */}
      {modifications.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Schedule Updates</p>
                <p className="text-sm text-amber-700">
                  {modifications.length} timetable modification(s) have been made.
                  Please check your schedule for any cancelled classes or substitute teachers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Subjects</p>
                <p className="text-lg font-bold">{subjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Hours</p>
                <p className="text-lg font-bold">9-4</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Room</p>
                <p className="text-lg font-bold">A33</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Faculty</p>
                <p className="text-lg font-bold">{teachers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timetable Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Timetable</CardTitle>
          <CardDescription>Your complete class schedule with updates</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={today !== "SUN" ? today : "MON"} className="w-full">
            <TabsList className="grid grid-cols-6 mb-6">
              {days.map((day) => (
                <TabsTrigger
                  key={day.id}
                  value={day.id}
                  className={day.id === today ? "bg-primary text-primary-foreground" : ""}
                >
                  {day.label.slice(0, 3)}
                </TabsTrigger>
              ))}
            </TabsList>

            {days.map((day) => (
              <TabsContent key={day.id} value={day.id} className="space-y-3">
                <h3 className="text-lg font-semibold mb-4">{day.label}</h3>
                <div className="space-y-3">
                  {getTimetableForDay(day.id).map(renderPeriod)}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
