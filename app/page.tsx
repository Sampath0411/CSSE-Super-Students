import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck,
  BarChart3,
  FileText,
  GraduationCap,
  Users,
  Bell,
  ArrowRight,
  CheckCircle,
  QrCode,
  LogIn,
  UserCog,
} from "lucide-react";

const highlights = [
  "Real-time attendance tracking with instant percentage calculation",
  "Location-based QR attendance with 10-meter radius validation",
  "Automatic flagging of students below 75% attendance threshold",
  "Simulated SMS/Email alerts for chronic absentees",
  "One-click document generation with student data auto-fill",
  "Interactive charts and analytics for attendance trends",
  "Exam eligibility tracking based on attendance percentage",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-6 py-16 lg:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <GraduationCap className="h-4 w-4" />
              Andhra University - CSSE Department
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              CSSE Super Student App
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              A 360-degree tool for teachers and administrators to manage attendance, track compliance with campus rules, 
              and instantly generate official student documentation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/login">
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Login Cards Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Portal</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select your role to access the appropriate features and functionality.
            </p>
          </div>
          
          {/* Portal Cards */}
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6 mb-12">
            {/* Student Portal Card */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-2">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Student Portal</CardTitle>
                <CardDescription>
                  View your attendance, scan QR codes for check-in, and track your academic progress.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    View attendance history
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Scan QR for attendance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Check exam eligibility
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/login">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Student Login
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Login with Registration/Roll Number
                </p>
              </CardContent>
            </Card>

            {/* Admin Portal Card */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-2">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <UserCog className="h-7 w-7 text-accent" />
                </div>
                <CardTitle className="text-xl">Admin / Faculty Portal</CardTitle>
                <CardDescription>
                  Manage attendance, view analytics, generate QR codes, and create official documents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Mark student attendance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Generate QR codes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Create certificates/letters
                  </li>
                </ul>
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/login">
                    <UserCog className="h-4 w-4 mr-2" />
                    Admin Login
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Login with University Email
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Feature Cards */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-2">Core Features</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <Card className="text-center p-4">
              <ClipboardCheck className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-medium text-sm">Digital Register</p>
              <p className="text-xs text-muted-foreground">Mark attendance quickly</p>
            </Card>
            <Card className="text-center p-4">
              <BarChart3 className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="font-medium text-sm">Analytics Dashboard</p>
              <p className="text-xs text-muted-foreground">View reports & trends</p>
            </Card>
            <Card className="text-center p-4">
              <QrCode className="h-8 w-8 text-warning mx-auto mb-2" />
              <p className="font-medium text-sm">QR Attendance</p>
              <p className="text-xs text-muted-foreground">10m radius validation</p>
            </Card>
            <Card className="text-center p-4">
              <FileText className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="font-medium text-sm">Letter Generator</p>
              <p className="text-xs text-muted-foreground">Official documents</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Key Highlights</h2>
              <p className="text-muted-foreground mb-8">
                Designed specifically for Andhra University faculty and staff, this application streamlines 
                daily administrative tasks and provides powerful insights into student attendance patterns.
              </p>
              <ul className="space-y-4">
                {highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                    <span className="text-foreground">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <p className="text-3xl font-bold text-foreground">30</p>
                  <p className="text-sm text-muted-foreground">Real Students</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <ClipboardCheck className="h-8 w-8 text-success mb-2" />
                  <p className="text-3xl font-bold text-foreground">9</p>
                  <p className="text-sm text-muted-foreground">Subjects Tracked</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <FileText className="h-8 w-8 text-accent mb-2" />
                  <p className="text-3xl font-bold text-foreground">4</p>
                  <p className="text-sm text-muted-foreground">Letter Templates</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Bell className="h-8 w-8 text-warning mb-2" />
                  <p className="text-3xl font-bold text-foreground">75%</p>
                  <p className="text-sm text-muted-foreground">Min Attendance</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Test Credentials Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Test Credentials</CardTitle>
              <CardDescription>Use these credentials to explore the application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="font-semibold text-sm flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Student Login
                  </p>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                    <p><span className="text-muted-foreground">Roll:</span> <code className="bg-background px-1.5 py-0.5 rounded">22211</code></p>
                    <p><span className="text-muted-foreground">Or Regd:</span> <code className="bg-background px-1.5 py-0.5 rounded">3235064022211</code></p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-sm flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-accent" />
                    Admin Login
                  </p>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                    <p><span className="text-muted-foreground">Email:</span> <code className="bg-background px-1.5 py-0.5 rounded text-xs">aneela@andhrauniversity.edu.in</code></p>
                    <p><span className="text-muted-foreground">Password:</span> <code className="bg-background px-1.5 py-0.5 rounded">admin123</code></p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Button asChild size="lg">
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Go to Login Page
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p className="mb-2">
            <span className="font-semibold text-foreground">CSSE Super Student App</span> - Andhra University
          </p>
          <p className="text-sm">
            Department of Computer Science and Systems Engineering, Visakhapatnam
          </p>
          <p className="text-xs mt-2">
            Class: 3/6 BTECH (CSE)-4, II Semester | Room A33 | W.E.F. 19-01-2026
          </p>
        </div>
      </footer>
    </div>
  );
}
