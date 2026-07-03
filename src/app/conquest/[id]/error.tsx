"use client";

import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    // Surface the real error in the console (visible via Safari Web Inspector on mobile)
    console.error("[conquest] render error:", error);
  }, [error]);

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
      <Alert className="bg-muted">
        <TriangleAlert className="size-4" />
        <AlertTitle>Something went wrong loading conquest</AlertTitle>
        <AlertDescription className="break-words">
          {error.message || "An unexpected error occurred."}
          {error.digest && (
            <span className="block mt-1 text-xs text-muted-foreground font-mono">
              digest: {error.digest}
            </span>
          )}
        </AlertDescription>
      </Alert>
      <Button variant="outline" className="w-fit" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
