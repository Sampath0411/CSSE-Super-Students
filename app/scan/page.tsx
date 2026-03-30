"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ScanRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if student is logged in
    const storedStudent = sessionStorage.getItem("studentUser");
    if (storedStudent) {
      router.push("/student/scan");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}
