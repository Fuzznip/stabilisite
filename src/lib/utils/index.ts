import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export const ranks = [
  {
    name: "Guest",
    textColor: "text-[#028968]",
    bgColor: "bg-[#028968]/50",
    progressColor: "[&>div]:bg-[#028968]",
  },
  {
    name: "Trialist",
    textColor: "text-[#D76222]",
    bgColor: "bg-[#D76222]/50",
    progressColor: "[&>div]:bg-[#D76222]",
  },
  {
    name: "Quester",
    textColor: "text-[#5077E3]",
    bgColor: "bg-[#5077E3]/50",
    progressColor: "[&>div]:bg-[#5077E3]",
  },
  {
    name: "Bronze",
    textColor: "text-[#5B462A]",
    bgColor: "bg-[#5B462A]/50",
    progressColor: "[&>div]:bg-[#5B462A]",
  },
  {
    name: "Iron",
    textColor: "text-[#635C5B]",
    bgColor: "bg-[#635C5B]/50",
    progressColor: "[&>div]:bg-[#635C5B]",
  },
  {
    name: "Steel",
    textColor: "text-[#8F8586]",
    bgColor: "bg-[#8F8586]/50",
    progressColor: "[&>div]:bg-[#8F8586]",
  },
  {
    name: "Mithril",
    textColor: "text-[#4C4C6F]",
    bgColor: "bg-[#4C4C6F]/50",
    progressColor: "[&>div]:bg-[#4C4C6F]",
  },
  {
    name: "Adamantite",
    textColor: "text-[#506350]",
    bgColor: "bg-[#506350]/50",
    progressColor: "[&>div]:bg-[#506350]",
  },
  {
    name: "Rune",
    textColor: "text-[#516D78]",
    bgColor: "bg-[#516D78]/50",
    progressColor: "[&>div]:bg-[#516D78]",
  },
  {
    name: "Dragon",
    textColor: "text-[#69140A]",
    bgColor: "bg-[#69140A]/50",
    progressColor: "[&>div]:bg-[#69140A]",
  },
] as const;

export function getScaleDisplay(scale: string): string {
  switch (scale) {
    case "1":
      return "Solo";
    case "2":
      return "Duo";
    case "3":
      return "Trio";
    case "4":
      return "4 Man";
    case "5":
      return "5 Man";
    case "8":
      return "8 Man";
    default:
      return ":(";
  }
}
