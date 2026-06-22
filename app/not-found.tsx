import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Compass className="h-10 w-10 text-primary" />
        </div>
        <p className="text-6xl font-bold text-foreground">404</p>
        <h1 className="text-2xl font-semibold text-foreground mt-2">Page not found</h1>
        <p className="text-muted-foreground mt-3">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
