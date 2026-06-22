"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { CountUp } from "@/components/count-up";
import { students, subjects, calculateStudentAttendance, ATTENDANCE_THRESHOLD } from "@/lib/data";
import {
  ClipboardCheck,
  BarChart3,
  FileText,
  GraduationCap,
  Users,
  ArrowRight,
  CheckCircle,
  Calendar,
  LogIn,
  UserCog,
  Shield,
  BookOpen,
} from "lucide-react";

const highlights = [
  "Real-time attendance tracking with instant percentage calculation",
  "Editable timetable with class cancellations and substitute teachers",
  "Automatic flagging of students below 75% attendance threshold",
  "Simulated SMS/Email alerts for chronic absentees",
  "One-click document generation with student data auto-fill",
  "Interactive charts and analytics for attendance trends",
  "Exam eligibility tracking based on attendance percentage",
];

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: "easeOut" },
} as const;

export default function HomePage() {
  const avgAttendance = Math.round(
    students.reduce((acc, s) => acc + calculateStudentAttendance(s.id).percentage, 0) / students.length
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-lg bg-white shadow-sm p-1">
              <Image src="/au-logo.png" alt="AU" fill className="object-contain p-0.5" />
            </div>
            <div className="leading-tight">
              <p className="font-bold text-sm text-foreground">CSSE Super Student</p>
              <p className="text-[10px] text-muted-foreground">Andhra University</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#portals" className="hover:text-foreground transition-colors">Portals</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#credentials" className="hover:text-foreground transition-colors">Demo Logins</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm">
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-1.5" />
                Login
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="container mx-auto px-6 py-20 lg:py-28 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24 rounded-full bg-white shadow-lg p-2">
                <Image src="/au-logo.png" alt="Andhra University Logo" fill className="object-contain rounded-full p-1" priority />
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <GraduationCap className="h-4 w-4" />
              Department of Computer Science &amp; Systems Engineering
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 text-balance tracking-tight">
              Attendance, letters &amp; academics —{" "}
              <span className="text-primary">one student portal</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              A 360° platform for students, faculty, and the HOD to manage attendance, track exam
              eligibility, run live anti-proxy sessions, and generate official documents.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/login">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#features">Explore Features</a>
              </Button>
            </div>
          </motion.div>

          {/* Stats band */}
          <motion.div
            {...reveal}
            className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { icon: Users, value: students.length, suffix: "", label: "Students", color: "text-primary" },
              { icon: BookOpen, value: subjects.length, suffix: "", label: "Subjects", color: "text-accent" },
              { icon: BarChart3, value: avgAttendance, suffix: "%", label: "Avg Attendance", color: "text-success" },
              { icon: Shield, value: ATTENDANCE_THRESHOLD, suffix: "%", label: "Min Required", color: "text-warning" },
            ].map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="pt-6">
                  <stat.icon className={`h-7 w-7 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-3xl font-bold text-foreground">
                    <CountUp end={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Portals */}
      <section id="portals" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div {...reveal} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Choose Your Portal</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each role gets a tailored experience with the right tools and permissions.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap, title: "Student Portal",
                blob: "bg-primary/5", iconWrap: "bg-primary/10", iconColor: "text-primary",
                desc: "Track attendance, exam eligibility, assignments, and request letters.",
                bullets: ["View attendance & eligibility", "Assignments & timetable", "Request official letters"],
                variant: "default" as const, note: "Login with Registration/Roll Number",
              },
              {
                icon: UserCog, title: "Faculty Portal",
                blob: "bg-accent/5", iconWrap: "bg-accent/10", iconColor: "text-accent",
                desc: "Mark attendance, run live sessions, manage assignments and timetables.",
                bullets: ["Mark attendance & live sessions", "Edit timetables & substitutions", "Create & manage assignments"],
                variant: "secondary" as const, note: "Login with University Email",
              },
              {
                icon: Shield, title: "HOD Portal",
                blob: "bg-warning/10", iconWrap: "bg-warning/10", iconColor: "text-warning",
                desc: "Oversee the department, approve letters, and send attendance alerts.",
                bullets: ["Department-wide analytics", "Approve student letters", "Send attendance alerts"],
                variant: "outline" as const, note: "Login with HOD Email",
              },
            ].map((portal) => (
              <motion.div key={portal.title} {...reveal}>
                <Card className="relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${portal.blob} rounded-full -mr-16 -mt-16`} />
                  <CardHeader className="pb-2">
                    <div className={`w-14 h-14 rounded-xl ${portal.iconWrap} flex items-center justify-center mb-4`}>
                      <portal.icon className={`h-7 w-7 ${portal.iconColor}`} />
                    </div>
                    <CardTitle className="text-xl">{portal.title}</CardTitle>
                    <CardDescription>{portal.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <ul className="space-y-2 text-sm text-muted-foreground flex-1">
                      {portal.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant={portal.variant} className="w-full">
                      <Link href="/login">
                        Enter Portal
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">{portal.note}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...reveal}>
              <h2 className="text-3xl font-bold text-foreground mb-6">Everything in one place</h2>
              <p className="text-muted-foreground mb-8">
                Built specifically for the CSSE department to streamline daily academic operations
                and give clear insight into attendance patterns.
              </p>
              <ul className="space-y-4">
                {highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                    <span className="text-foreground">{h}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...reveal} className="grid grid-cols-2 gap-4">
              {[
                { icon: ClipboardCheck, color: "text-primary", title: "Digital Register", sub: "Mark attendance fast" },
                { icon: BarChart3, color: "text-success", title: "Analytics", sub: "Reports & trends" },
                { icon: Calendar, color: "text-warning", title: "Smart Timetable", sub: "Cancellations & substitutes" },
                { icon: FileText, color: "text-accent", title: "Letter Generator", sub: "Official documents" },
              ].map((f) => (
                <Card key={f.title} className="text-center p-5 hover:shadow-lg transition-shadow">
                  <f.icon className={`h-8 w-8 mx-auto mb-2 ${f.color}`} />
                  <p className="font-medium text-sm">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.sub}</p>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section id="credentials" className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div {...reveal}>
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle>Test Credentials</CardTitle>
                <CardDescription>Use these to explore each portal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" /> Student
                    </p>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                      <p><span className="text-muted-foreground">Roll:</span> <code className="bg-background px-1.5 py-0.5 rounded">22211</code></p>
                      <p><span className="text-muted-foreground">Pass:</span> <code className="bg-background px-1.5 py-0.5 rounded">Student123</code></p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-sm flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-accent" /> Faculty
                    </p>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                      <p><span className="text-muted-foreground">Email:</span> <code className="bg-background px-1.5 py-0.5 rounded text-xs">aneela@andhrauniversity.edu.in</code></p>
                      <p><span className="text-muted-foreground">Pass:</span> <code className="bg-background px-1.5 py-0.5 rounded">admin123</code></p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4 text-warning" /> HOD
                    </p>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                      <p><span className="text-muted-foreground">Email:</span> <code className="bg-background px-1.5 py-0.5 rounded text-xs">hod@andhrauniversity.edu.in</code></p>
                      <p><span className="text-muted-foreground">Pass:</span> <code className="bg-background px-1.5 py-0.5 rounded">hod123</code></p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <Button asChild size="lg">
                    <Link href="/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Go to Login
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="relative w-8 h-8 rounded-lg bg-white shadow-sm p-1">
              <Image src="/au-logo.png" alt="AU" fill className="object-contain p-0.5" />
            </div>
            <span className="font-semibold text-foreground">CSSE Super Student App</span>
          </div>
          <p className="text-sm">Department of Computer Science and Systems Engineering, Visakhapatnam</p>
          <p className="text-xs mt-2">Class: 3/6 BTECH (CSE)-4, II Semester | Room A33 | W.E.F. 19-01-2026</p>
        </div>
      </footer>
    </div>
  );
}
