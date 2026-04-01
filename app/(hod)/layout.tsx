"use client";

import { HODSidebar } from "@/components/hod-sidebar";
import { SessionProvider } from "@/components/session-provider";

export default function HODLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider userType="hod" storageKey="hodUser">
      <div className="min-h-screen bg-background">
        <HODSidebar />
        <main className="lg:pl-64 pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
