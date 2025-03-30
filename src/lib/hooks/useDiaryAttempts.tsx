import { User } from "../types";

type DiaryAttempt = {
  id: string;
  diary: string;
  date: Date;
  time: string;
  team: string[];
  scale: string;
  proof: string;
};
export default function useDiaryAttempts(user?: User | null): DiaryAttempt[] {
  if (user?.discordId === "testingggg") {
    console.log(user);
  }
  return [
    {
      id: "1",
      diary: "Inferno",
      date: new Date(),
      time: "2:08:42",
      team: ["Tboodle"],
      scale: "solo",
      proof: "https://test.com",
    },
    {
      id: "2",
      diary: "Expert TOA",
      date: new Date(),
      time: "19:39",
      team: [
        "Tboodle",
        "Funzip",
        "Barsk",
        "TheChowMein",
        "BeforeNA",
        "Biapa",
        "HeavenlyFist",
        "SoccerTheNub",
      ],
      scale: "8 man",
      proof: "https://test.com",
    },
    {
      id: "3",
      diary: "Expert TOA",
      date: new Date("05/24/2025"),
      time: "18:58",
      team: [
        "Tboodle",
        "Funzip",
        "Barsk",
        "TheChowMein",
        "BeforeNA",
        "Biapa",
        "HeavenlyFist",
        "SoccerTheNub",
      ],
      scale: "8 man",
      proof: "https://test.com",
    },
    {
      id: "4",
      diary: "Expert TOA",
      date: new Date("08/24/2025"),
      time: "34:17",
      team: [
        "Tboodle",
        "Funzip",
        "Barsk",
        "TheChowMein",
        "BeforeNA",
        "Biapa",
        "HeavenlyFist",
        "SoccerTheNub",
      ],
      scale: "8 man",
      proof: "https://test.com",
    },
    {
      id: "5",
      diary: "Expert TOA",
      date: new Date("02/24/2025"),
      time: "30:01",
      team: [
        "Tboodle",
        "Funzip",
        "Barsk",
        "TheChowMein",
        "BeforeNA",
        "Biapa",
        "HeavenlyFist",
        "SoccerTheNub",
      ],
      scale: "8 man",
      proof: "https://test.com",
    },
    {
      id: "6",
      diary: "Expert TOA",
      date: new Date("11/24/2024"),
      time: "25:17",
      team: [
        "Tboodle",
        "Funzip",
        "Barsk",
        "TheChowMein",
        "BeforeNA",
        "Biapa",
        "HeavenlyFist",
        "SoccerTheNub",
      ],
      scale: "8 man",
      proof: "https://test.com",
    },
    {
      id: "7",
      diary: "Expert TOA",
      date: new Date("03/18/2025"),
      time: "42:17",
      team: [
        "Tboodle",
        "Funzip",
        "Barsk",
        "TheChowMein",
        "BeforeNA",
        "Biapa",
        "HeavenlyFist",
        "SoccerTheNub",
      ],
      scale: "8 man",
      proof: "https://test.com",
    },
  ];
}
