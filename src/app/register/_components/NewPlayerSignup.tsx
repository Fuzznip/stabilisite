"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { registerUser } from "../_actions/getAuthUser";

export default function NewPlayerSignUp(): React.ReactElement {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerUser(username);
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
      <Input
        placeholder="Enter OSRS username..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Button type="submit" className="w-fit ml-auto">
        Enter
      </Button>
    </form>
  );
}
