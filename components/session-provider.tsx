"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SESSION_TIMEOUTS, type SessionActivity } from "@/lib/data";

interface SessionContextType {
  lastActivity: number;
  updateActivity: () => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

interface SessionProviderProps {
  children: React.ReactNode;
  userType: "student" | "faculty" | "hod";
  storageKey: string;
}

export function SessionProvider({ children, userType, storageKey }: SessionProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [isInitialized, setIsInitialized] = useState(false);

  const logout = useCallback(() => {
    // Clear session data
    sessionStorage.removeItem(storageKey);
    sessionStorage.removeItem(`${userType}_session_activity`);
    router.push("/login");
  }, [router, storageKey, userType]);

  const updateActivity = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);

    // Store activity in sessionStorage
    const sessionData: SessionActivity = {
      userId: "",
      userType,
      lastActivity: now,
      loginTime: parseInt(sessionStorage.getItem(`${userType}_login_time`) || now.toString()),
    };

    // Try to get userId from session
    const userData = sessionStorage.getItem(storageKey);
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        sessionData.userId = parsed.id || parsed.regdNo || "";
      } catch {
        // Ignore parse error
      }
    }

    sessionStorage.setItem(`${userType}_session_activity`, JSON.stringify(sessionData));
  }, [userType, storageKey]);

  // Initialize session tracking
  useEffect(() => {
    const userData = sessionStorage.getItem(storageKey);
    if (!userData) {
      router.push("/login");
      return;
    }

    // Set login time if not already set
    if (!sessionStorage.getItem(`${userType}_login_time`)) {
      sessionStorage.setItem(`${userType}_login_time`, Date.now().toString());
    }

    updateActivity();
    setIsInitialized(true);
  }, [router, storageKey, userType, updateActivity]);

  // Check for session timeout periodically
  useEffect(() => {
    if (!isInitialized) return;

    const timeout = SESSION_TIMEOUTS[userType];

    const checkTimeout = () => {
      const sessionData = sessionStorage.getItem(`${userType}_session_activity`);
      if (sessionData) {
        try {
          const parsed: SessionActivity = JSON.parse(sessionData);
          const now = Date.now();
          const elapsed = now - parsed.lastActivity;

          if (elapsed > timeout) {
            logout();
          }
        } catch {
          // Invalid session data, logout
          logout();
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkTimeout, 60000);

    // Also check on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkTimeout();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isInitialized, userType, logout]);

  // Update activity on user interaction
  useEffect(() => {
    if (!isInitialized) return;

    const events = ["mousedown", "keydown", "touchstart", "scroll"];

    const handleActivity = () => {
      updateActivity();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isInitialized, updateActivity]);

  // Update activity on route change
  useEffect(() => {
    if (isInitialized) {
      updateActivity();
    }
  }, [pathname, isInitialized, updateActivity]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ lastActivity, updateActivity, logout }}>
      {children}
    </SessionContext.Provider>
  );
}
