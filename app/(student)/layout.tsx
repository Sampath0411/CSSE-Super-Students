"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  LayoutDashboard,
  ClipboardCheck,
  User,
  LogOut,
  Menu,
  X,
  BookOpen,
  FileText,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { type Student } from "@/lib/data";

const navItems = [
  {
    title: "Dashboard",
    href: "/student",
    icon: LayoutDashboard,
  },
  {
    title: "My Attendance",
    href: "/student/attendance",
    icon: ClipboardCheck,
  },
  {
    title: "Timetable",
    href: "/student/timetable",
    icon: Calendar,
  },
  {
    title: "Assignments",
    href: "/student/assignments",
    icon: FileSpreadsheet,
  },
  {
    title: "Letters",
    href: "/student/letters",
    icon: FileText,
  },
  {
    title: "Profile",
    href: "/student/profile",
    icon: User,
  },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [student, setStudent] = useState<Student | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedStudent = sessionStorage.getItem("studentUser");
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    } else {
      router.push("/login");
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("studentUser");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-primary text-primary-foreground z-50 shadow-md">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-primary-foreground/10 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/student" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <p className="font-semibold text-sm">Student Portal</p>
                <p className="text-xs opacity-80">CSSE - Andhra University</p>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-sm">{student.name}</p>
              <p className="text-xs opacity-80">Roll: {student.rollNumber}</p>
            </div>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border z-40 transition-transform duration-300",
          "lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-4 lg:hidden">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{student.name}</p>
              <p className="text-xs text-muted-foreground">Roll: {student.rollNumber}</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
