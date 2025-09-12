export enum MedalTier {
  None = 0,
  Bronze = 1,
  Silver = 2,
  Gold = 3,
}

export type ProgressLogEntry ={
  name: string;
  value: number;
}

export type TaskProgress = {
  task: string;
  completed: boolean;
  value: number;
  required: number;
  proofUrl?: string;                
  log?: ProgressLogEntry[];   
}

export type ProgressRow = TaskProgress[];

export type BoardProgressTile = {
  name: string;
  progress?: ProgressRow[];     
}

export type Team = {
  name: string;
  members: string[];
  image_url: string;
  points: number;
  board_state: MedalTier[];   
  board_progress?: BoardProgressTile[];
}

export type TeamsPayload = {
  teams: Team[];
}

export type Trigger =
  | string[]             
  | string[][];       

export type Task = {
  task: string;
  required: number;
  triggers: Trigger;
}

export type Tile = {
  name: string;
  tasks?: Task[];
}

export type BoardPayload = {
  board: Tile[];
}
