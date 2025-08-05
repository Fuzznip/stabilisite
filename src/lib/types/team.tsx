export type Team = {
  id?: string;
  name: string;
  points: number;
  captain: string;
  event: string;
  members: string[];
  imgSrc: string;
  tileProgress: TileProgress[];
};

type TileProgress = {
  tile: number;
  task1: TaskProgress;
  task2: TaskProgress;
  task3: TaskProgress;
};

type TaskProgress = { complete: boolean; target: number };
