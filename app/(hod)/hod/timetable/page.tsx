"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Users, BookOpen, MapPin, XCircle, UserCheck, RotateCcw, AlertCircle, History } from "lucide-react";
import { timetable, subjects, teachers, timeSlots, type TimetableEntry, type Teacher, type TimetableModification } from "@/lib/data";
import {
  getEffectiveTimetable,
  getModifications,
  cancelPeriod,
  assignSubstitute,
  restorePeriod,
  type TimetableModification as StoreModification
} from "@/lib/timetable-store";

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

export default function HODTimetablePage() {
  const [selectedDay, setSelectedDay] = useState("MON");
  const [effectiveTimetable, setEffectiveTimetable] = useState<TimetableEntry[]>(timetable);
  const [modifications, setModifications] = useState<StoreModification[]>([]);
  const [hod, setHOD] = useState<Teacher | null>(null);

  // Dialog states
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showSubstituteDialog, setShowSubstituteDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [substituteTeacherId, setSubstituteTeacherId] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const storedHOD = sessionStorage.getItem("hodUser");
    if (storedHOD) {
      setHOD(JSON.parse(storedHOD));
    }
    loadTimetableData();
  }, []);

  const loadTimetableData = () => {
    setEffectiveTimetable(getEffectiveTimetable());
    setModifications(getModifications());
  };

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

  const handleCancelClick = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setReason("");
    setShowCancelDialog(true);
  };

  const handleSubstituteClick = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setSubstituteTeacherId("");
    setReason("");
    setShowSubstituteDialog(true);
  };

  const handleRestoreClick = (entry: TimetableEntry) => {
    if (!hod) return;
    restorePeriod(entry.day, entry.period, hod.id, hod.name);
    loadTimetableData();
  };

  const confirmCancel = () => {
    if (!selectedEntry || !hod) return;
    cancelPeriod(selectedEntry.day, selectedEntry.period, hod.id, hod.name, reason);
    setShowCancelDialog(false);
    setSelectedEntry(null);
    setReason("");
    loadTimetableData();
  };

  const confirmSubstitute = () => {
    if (!selectedEntry || !hod || !substituteTeacherId) return;
    assignSubstitute(selectedEntry.day, selectedEntry.period, substituteTeacherId, hod.id, hod.name, reason);
    setShowSubstituteDialog(false);
    setSelectedEntry(null);
    setSubstituteTeacherId("");
    setReason("");
    loadTimetableData();
  };

  const renderPeriod = (entry: TimetableEntry) => {
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

    return (
      <div
        key={`${entry.day}-${entry.period}`}
        className={`p-4 rounded-lg border ${
          entry.subjectId && !isCancelled
            ? "bg-card hover:shadow-md transition-shadow"
            : isCancelled
            ? "bg-red-50 border-red-200"
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
                    <Users className="h-3 w-3 inline mr-1" />
                    {originalTeacher.name}
                  </p>
                ) : null}
              </>
            ) : isCancelled ? (
              <div className="space-y-1">
                <p className="text-red-700 font-medium line-through">
                  {subject?.name || typeLabels[entry.type]}
                </p>
                {entry.modificationReason && (
                  <p className="text-xs text-red-600">
                    Reason: {entry.modificationReason}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground font-medium">{typeLabels[entry.type]}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className={`${typeColors[entry.type]} capitalize`}>
              {typeLabels[entry.type]}
            </Badge>

            {/* Action buttons */}
            {entry.subjectId && (
              <div className="flex gap-1 mt-2">
                {isCancelled ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleRestoreClick(entry)}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restore
                  </Button>
                ) : (
                  <>
                    {!isSubstitute && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
                        onClick={() => handleSubstituteClick(entry)}
                      >
                        <UserCheck className="h-3 w-3 mr-1" />
                        Substitute
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleCancelClick(entry)}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Count today's modifications
  const today = new Date().toISOString().split("T")[0];
  const todayModifications = modifications.filter(m => m.modifiedAt.startsWith(today));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Class Timetable</h1>
            <p className="text-muted-foreground">
              3/6 B.Tech (CSE)-4, II Semester - Room A33
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Subjects</p>
                <p className="text-xl font-bold">{subjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Class Hours</p>
                <p className="text-xl font-bold">9:00 AM - 4:00 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Faculty</p>
                <p className="text-xl font-bold">{teachers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors" onClick={() => setShowHistoryDialog(true)}>
              <History className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Modifications Today</p>
                <p className="text-xl font-bold">{todayModifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modification Notice */}
      {modifications.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            {modifications.length} timetable modification(s) have been made.
            Attendance tracking will follow the modified schedule.
          </AlertDescription>
        </Alert>
      )}

      {/* Timetable Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>Manage class schedule - click Cancel or Substitute to modify</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowHistoryDialog(true)}>
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="MON" className="w-full">
            <TabsList className="grid grid-cols-6 mb-6">
              {days.map((day) => (
                <TabsTrigger key={day.id} value={day.id}>
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

      {/* Subject List */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Details</CardTitle>
          <CardDescription>Complete list of subjects and faculty</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {subjects.map((subject) => {
              const teacher = getTeacherInfo(subject.teacherId);
              return (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div>
                    <h4 className="font-medium">{subject.name}</h4>
                    <p className="text-sm text-muted-foreground">{subject.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{teacher?.name}</p>
                    <Badge variant={subject.type === "lab" ? "secondary" : "outline"}>
                      {subject.credits} Credits
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this class? Students will not be able to mark attendance.
            </DialogDescription>
          </DialogHeader>

          {selectedEntry && (
            <div className="py-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{getSubjectInfo(selectedEntry.subjectId)?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedEntry.day} - Period {selectedEntry.period}
                </p>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium">Reason (optional)</label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Substitute Dialog */}
      <Dialog open={showSubstituteDialog} onOpenChange={setShowSubstituteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Substitute Teacher</DialogTitle>
            <DialogDescription>
              Select a substitute teacher for this class.
            </DialogDescription>
          </DialogHeader>

          {selectedEntry && (
            <div className="py-4 space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{getSubjectInfo(selectedEntry.subjectId)?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedEntry.day} - Period {selectedEntry.period}
                </p>
                {selectedEntry.subjectId && (
                  <p className="text-sm text-muted-foreground">
                    Original Teacher: {getTeacherInfo(subjects.find(s => s.id === selectedEntry.subjectId)?.teacherId || "")?.name}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Substitute Teacher</label>
                <Select value={substituteTeacherId} onValueChange={setSubstituteTeacherId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select substitute teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Reason (optional)</label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for substitution..."
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubstituteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSubstitute} disabled={!substituteTeacherId}>
              Assign Substitute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Timetable Modification History</DialogTitle>
            <DialogDescription>
              History of all timetable changes
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            {modifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No modifications recorded yet.
              </p>
            ) : (
              modifications.map((mod) => (
                <div key={mod.id} className="p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {mod.day} - Period {mod.period}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {mod.action === "cancelled" && "Class Cancelled"}
                        {mod.action === "substituted" && "Teacher Substituted"}
                        {mod.action === "assigned" && "Restored to Original"}
                      </p>
                    </div>
                    <Badge variant={mod.action === "cancelled" ? "destructive" : mod.action === "substituted" ? "default" : "secondary"}>
                      {mod.action}
                    </Badge>
                  </div>
                  {mod.newTeacherId && (
                    <p className="text-sm mt-1">
                      Substitute: {getTeacherInfo(mod.newTeacherId)?.name}
                    </p>
                  )}
                  {mod.reason && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Reason: {mod.reason}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Modified by {mod.modifiedByName} on {new Date(mod.modifiedAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple Alert component for the modification notice
function Alert({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 rounded-lg flex items-start gap-3 ${className}`}>
      {children}
    </div>
  );
}

function AlertDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm ${className}`}>{children}</p>;
}
