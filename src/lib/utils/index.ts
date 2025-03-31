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
