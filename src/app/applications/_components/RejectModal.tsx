"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type RejectAction = (id: string, reason: string) => Promise<void>;

interface RejectModalProps {
  applicationId: string;
  rejectAction: RejectAction;
}

export default function RejectModal({
  applicationId,
  rejectAction,
}: RejectModalProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      await rejectAction(applicationId, reason);
      setOpen(false);
      setReason("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="text-red-500 border-red-500 hover:cursor-pointer"
          variant="outline"
        >
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Application</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rejection-reason">Rejection reason</Label>
          <Textarea
            id="rejection-reason"
            placeholder="Provide a reason for rejection..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="text-red-500 border-red-500"
            variant="outline"
            disabled={isPending || !reason.trim()}
            onClick={handleSubmit}
          >
            {isPending ? "Rejecting..." : "Confirm Rejection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
