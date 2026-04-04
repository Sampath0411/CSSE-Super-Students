"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseSessionFromUrl } from "@/lib/anti-proxy";
import { Shield, CheckCircle, XCircle } from "lucide-react";

export default function VerifyAttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if there's a session parameter
    const sessionParam = searchParams.get("session");

    if (sessionParam) {
      // Parse and validate session from URL
      const result = parseSessionFromUrl();

      if (result.valid) {
        // Session is valid, redirect to student dashboard
        // The session data is now stored in localStorage
        router.push("/student");
      }
    }
  }, [searchParams, router]);

  const handleGoToDashboard = () => {
    router.push("/student");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Attendance Verification</CardTitle>
          <CardDescription>
            Verify your attendance session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              This feature is currently under development.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please use the main dashboard to view your attendance.
            </p>
          </div>

          <Button onClick={handleGoToDashboard} className="w-full">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
