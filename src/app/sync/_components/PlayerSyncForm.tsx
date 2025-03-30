"use client";

import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { useState } from "react";
import { syncUser } from "../_actions/syncUser";
import { LoadingSpinner } from "@/lib/components/LoadingSpinner";

export default function PlayerSyncForm(): React.ReactElement {
  const [username, setUsername] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    syncUser(username);
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
      <Input
        placeholder="Enter OSRS username..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Button
        type="submit"
        className="w-24 ml-auto bg-stability text-white hover:bg-stability/90"
      >
        {isRegistering ? <LoadingSpinner /> : "Enter"}
      </Button>
    </form>
  );
}
