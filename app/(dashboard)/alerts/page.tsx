"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Trash2,
  User,
  Percent,
} from "lucide-react";
import { getEmailAlerts, clearOldAlerts } from "@/lib/email-service";
import { students, calculateStudentAttendance, getChronicAbsentees } from "@/lib/data";

interface EmailAlert {
  studentId: string;
  studentEmail: string;
  studentName: string;
  attendancePercentage: number;
  subject?: string;
  sentAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<EmailAlert[]>([]);
  const [chronicAbsentees, setChronicAbsentees] = useState<
    Array<{ student: typeof students[0]; attendance: { percentage: number } }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    const emailAlerts = getEmailAlerts();
    setAlerts(emailAlerts.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()));
    setChronicAbsentees(getChronicAbsentees(75));
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClearOld = () => {
    clearOldAlerts();
    loadData();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Attendance Alerts</h1>
            <p className="text-muted-foreground">
              Email notifications sent to students below 75% attendance
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Emails Sent</p>
                <p className="text-xl font-bold">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">At Risk Students</p>
                <p className="text-xl font-bold">{chronicAbsentees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Percent className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Threshold</p>
                <p className="text-xl font-bold">75%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Button variant="outline" className="w-full" onClick={handleClearOld}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Old
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sent">Sent Emails ({alerts.length})</TabsTrigger>
          <TabsTrigger value="atrisk">At Risk Students ({chronicAbsentees.length})</TabsTrigger>
        </TabsList>

        {/* Sent Emails Tab */}
        <TabsContent value="sent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Alert Log
              </CardTitle>
              <CardDescription>
                Automatically sent when attendance falls below 75%
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{alert.studentName}</span>
                          <Badge variant="destructive">
                            {alert.attendancePercentage}%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          {alert.studentEmail}
                        </p>
                        {alert.subject && (
                          <p className="text-sm text-muted-foreground ml-6">
                            Subject: {alert.subject}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(alert.sentAt)}
                        </div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          Sent
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No email alerts sent yet</p>
                  <p className="text-sm">
                    Alerts are automatically sent when attendance falls below 75%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* At Risk Students Tab */}
        <TabsContent value="atrisk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Students Below 75%
              </CardTitle>
              <CardDescription>
                Students with critically low attendance who should receive alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chronicAbsentees.length > 0 ? (
                <div className="space-y-3">
                  {chronicAbsentees.map(({ student, attendance }) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{student.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          Roll: {student.rollNumber} | {student.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive" className="text-lg">
                          {attendance.percentage}%
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          At Risk
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>All students are above 75% attendance</p>
                  <p className="text-sm">Great job!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Alert */}
      <Alert>
        <Bell className="h-4 w-4" />
        <AlertDescription>
          Email alerts are automatically triggered whenever attendance is marked and falls below 75%.
          Each student receives at most one alert per 24 hours to avoid spam.
        </AlertDescription>
      </Alert>
    </div>
  );
}
