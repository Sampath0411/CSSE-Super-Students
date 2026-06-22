"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-accent/5 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Something went wrong</h1>
        <p className="text-muted-foreground mt-3">
          An unexpected error occurred. You can try again, or head back to the home page.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
