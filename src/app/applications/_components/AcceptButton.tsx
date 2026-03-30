"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export default function AcceptButton(): React.ReactElement {
  const { pending } = useFormStatus();
  return (
    <Button
      className="text-green-500 border-green-500 hover:cursor-pointer"
      variant="outline"
      disabled={pending}
    >
      {pending ? "Accepting..." : "Accept"}
    </Button>
  );
}
