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
    name: "unranked",
    textColor: "text-foreground",
    bgColor: "bg-foreground/50",
    progressColor: "[&>div]:bg-foreground",
  },
  {
    name: "guest",
    textColor: "text-[#1A8266]",
    bgColor: "bg-[#1A8266]/50",
    progressColor: "[&>div]:bg-[#1A8266]",
  },
  {
    name: "trialist",
    textColor: "text-[#D0B230]",
    bgColor: "bg-[#D0B230]/50",
    progressColor: "[&>div]:bg-[#D0B230]",
  },
  {
    name: "bronze",
    textColor: "text-[#5B462A]",
    bgColor: "bg-[#5B462A]/50",
    progressColor: "[&>div]:bg-[#5B462A]",
  },
  {
    name: "iron",
    textColor: "text-[#635C5B]",
    bgColor: "bg-[#635C5B]/50",
    progressColor: "[&>div]:bg-[#635C5B]",
  },
  {
    name: "steel",
    textColor: "text-[#8F8586]",
    bgColor: "bg-[#8F8586]/50",
    progressColor: "[&>div]:bg-[#8F8586]",
  },
  {
    name: "mithril",
    textColor: "text-[#4C4C6F]",
    bgColor: "bg-[#4C4C6F]/50",
    progressColor: "[&>div]:bg-[#4C4C6F]",
  },
  {
    name: "adamantite",
    textColor: "text-[#506350]",
    bgColor: "bg-[#506350]/50",
    progressColor: "[&>div]:bg-[#506350]",
  },
  {
    name: "rune",
    textColor: "text-[#516D78]",
    bgColor: "bg-[#516D78]/50",
    progressColor: "[&>div]:bg-[#516D78]",
  },
  {
    name: "dragon",
    textColor: "text-[#69140A]",
    bgColor: "bg-[#69140A]/50",
    progressColor: "[&>div]:bg-[#69140A]",
  },
] as const;

export const diaries = [
  { name: "Fight Caves", scales: ["solo"] },
  { name: "Inferno", scales: ["solo"] },
  { name: "Fortis Colosseum", scales: ["solo"] },
  {
    name: "Theatre of Blood",
    scales: ["duo", "trio", "4 man", "5 man"],
  },
  {
    name: "Theatre of Blood: Hard Mode",
    scales: ["duo", "trio", "4 man", "5 man"],
  },
  { name: "Challenge Mode COX", scales: ["solo", "trio", "5 man"] },
  { name: "Expert TOA", scales: ["solo", "8 man"] },
];
