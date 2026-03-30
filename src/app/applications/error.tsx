"use client";

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
  return (
    <div className="flex flex-col gap-4 w-1/2 mx-auto">
      <Alert className="bg-muted">
        <TriangleAlert className="size-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>{error.message || "An unexpected error occurred loading applications."}</AlertDescription>
      </Alert>
      <Button variant="outline" className="w-fit" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
