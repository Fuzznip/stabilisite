export enum MedalTier {
  None = 0,
  Bronze = 1,
  Silver = 2,
  Gold = 3,
}

export type ProgressLogEntry = {
  name: string;
  value: number;
  required: string;
};

export type TaskProgress = {
  task_id: string;
  task_index: string;
  completed: boolean;
  proof?: string;
  log?: ProgressLogEntry[];
};

export type TileProgress = {
  name: string;
  progress: TaskProgress[];
};

export type Team = {
  team_id: string;
  name: string;
  members: string[];
  image_url: string;
  points: number;
  board_state: MedalTier[];
  board_progress: TileProgress[];
};

export type TeamsPayload = {
  teams: Team[];
};

export type Trigger = string[][];

export type Task = {
  name: string;
  required: number;
  triggers: Trigger;
  index: number;
};

export type Tile = {
  id: string;
  name: string;
  tasks: Task[];
};

export type BoardPayload = {
  board: Tile[];
};
