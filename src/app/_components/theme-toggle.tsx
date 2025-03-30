"use client";

import { Button } from "@/lib/components/ui/button";
import { SunIcon, MoonIcon } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = function () {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const ThemeIcon = theme === "dark" ? SunIcon : MoonIcon;
  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() => toggleTheme()}
    >
      <ThemeIcon className="mr-2 size-4" aria-hidden="true" />
      Toggle Theme
    </Button>
  );
}
