"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Menu,
  X,
  QrCode,
  LogOut,
  Home,
  Calendar,
  ScanFace,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { type Teacher } from "@/lib/data";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Analytics & Reports",
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: ClipboardCheck,
    description: "Mark Attendance",
  },
  {
    title: "QR Attendance",
    href: "/qr-attendance",
    icon: QrCode,
    description: "Location-Based QR",
  },
  {
    title: "Face Attendance",
    href: "/face-attendance",
    icon: ScanFace,
    description: "AI Face Recognition",
  },
  {
    title: "Timetable",
    href: "/timetable",
    icon: Calendar,
    description: "Class Schedule",
  },
  {
    title: "Letters",
    href: "/letters",
    icon: FileText,
    description: "Generate Documents",
  },
  {
    title: "Alerts",
    href: "/alerts",
    icon: Bell,
    description: "Email Notifications",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [admin, setAdmin] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = sessionStorage.getItem("adminUser");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    } else {
      router.push("/login");
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminUser");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="fixed top-0 left-0 h-full w-64 bg-sidebar flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-sidebar-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-bold text-sidebar-foreground">Admin Portal</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="text-sidebar-foreground"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 transition-transform duration-300",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-4 border-b border-sidebar-border">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground">Admin Portal</h1>
              <p className="text-xs text-sidebar-foreground/60">CSSE - Andhra University</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-4">
              Main Menu
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs opacity-70">{item.description}</p>
                  </div>
                </Link>
              );
            })}
            
            <div className="pt-4">
              <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-4">
                Quick Links
              </p>
              <Link
                href="/"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
              >
                <Home className="h-5 w-5" />
                <div>
                  <p className="font-medium">Home</p>
                  <p className="text-xs opacity-70">Back to landing</p>
                </div>
              </Link>
            </div>
          </nav>

          {/* Footer with User Info & Logout */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 bg-sidebar-accent/30 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-semibold">
                {admin.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{admin.name}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{admin.department}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
