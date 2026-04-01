"use client";

import { FacultySidebar } from "@/components/faculty-sidebar";
import { SessionProvider } from "@/components/session-provider";

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider userType="faculty" storageKey="facultyUser">
      <div className="min-h-screen bg-background">
        <FacultySidebar />
        <main className="lg:pl-64 pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
