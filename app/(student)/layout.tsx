"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  BookOpen,
  FileText,
  Calendar,
  FileSpreadsheet,
  Bell,
} from "lucide-react";
import { getUnreadNotificationCount } from "@/lib/notifications";
import { ThemeToggle } from "@/components/theme-toggle";
import { type Student } from "@/lib/data";
import Image from "next/image";
import { SessionProvider } from "@/components/session-provider";

const navItems = [
  {
    title: "Dashboard",
    href: "/student",
    icon: LayoutDashboard,
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
    title: "Notifications",
    href: "/student/notifications",
    icon: Bell,
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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const storedStudent = sessionStorage.getItem("studentUser");
    if (storedStudent) {
      const parsed = JSON.parse(storedStudent);
      setStudent(parsed);
      setUnreadCount(getUnreadNotificationCount(parsed.id));
    } else {
      router.push("/login");
    }
    setIsLoading(false);
  }, [router]);

  // Refresh unread count every 30 seconds
  useEffect(() => {
    if (!student) return;
    const interval = setInterval(() => {
      setUnreadCount(getUnreadNotificationCount(student.id));
    }, 30000);
    return () => clearInterval(interval);
  }, [student]);

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
    <SessionProvider userType="student" storageKey="studentUser">
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
            <Link href="/student/notifications" className="relative p-2 hover:bg-primary-foreground/10 rounded-lg">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <Link href="/student/profile" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-foreground/20 flex items-center justify-center border-2 border-primary-foreground/30">
                {student.photo ? (
                  <Image
                    src={student.photo}
                    alt={student.name}
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-sm font-bold">
                    {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="text-right hidden sm:block">
                <p className="font-medium text-sm">{student.name}</p>
                <p className="text-xs opacity-80">Roll: {student.rollNumber}</p>
              </div>
            </Link>
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
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              {student.photo ? (
                <Image
                  src={student.photo}
                  alt={student.name}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-lg font-bold text-primary">
                  {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-sm">{student.name}</p>
              <p className="text-xs text-muted-foreground">Roll: {student.rollNumber}</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isNotifications = item.href === "/student/notifications";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </div>
                  {isNotifications && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
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
    </SessionProvider>
  );
}
