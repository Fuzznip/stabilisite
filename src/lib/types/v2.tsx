// ===========================================
// BASE MODELS - Direct database representations
// ===========================================

export type Event = {
  id: string;
  name: string;
  start_date: string; // ISO 8601 datetime
  end_date: string; // ISO 8601 datetime
  thread_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Team = {
  id: string;
  event_id: string;
  name: string;
  image_url: string | null;
  points: number;
  created_at: string;
  updated_at: string;
  members: string[]; // Array of RuneScape usernames
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Action = {
  id: string;
  player_id: string;
  type: string; // 'KC' | 'DROP' | 'QUEST' | 'ACHIEVEMENT' | 'DIARY' | 'SKILL'
  name: string;
  source: string | null;
  quantity: number;
  value: number | null;
  date: string; // ISO 8601 datetime
  created_at: string;
};

export type Trigger = {
  id: string;
  name: string;
  source: string | null;
  type: string; // 'DROP' | 'KC' | etc.
  img_path: string | null;
  created_at: string;
  updated_at: string;
};

export type Tile = {
  id: string;
  event_id: string;
  name: string;
  img_src: string | null;
  index: number; // 0-24 for 5x5 bingo board
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  tile_id: string;
  name: string;
  require_all: boolean; // true = AND logic, false = OR logic
  created_at: string;
  updated_at: string;
};

export type Challenge = {
  id: string;
  task_id: string;
  parent_challenge_id: string | null;
  trigger_id: string;
  require_all: boolean;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type TileStatus = {
  id: string;
  team_id: string;
  tile_id: string;
  tasks_completed: number; // 0=none, 1=bronze, 2=silver, 3=gold
  created_at: string;
  updated_at: string;
};

export type TaskStatus = {
  id: string;
  team_id: string;
  task_id: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type ChallengeStatus = {
  id: string;
  team_id: string;
  challenge_id: string;
  quantity: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type ChallengeProof = {
  id: string;
  challenge_status_id: string;
  action_id: string;
  created_at: string;
};

// ===========================================
// API RESPONSE TYPES - Includes relational data
// ===========================================

/**
 * Response from GET /v2/events/active and GET /v2/events/:id
 * Includes related teams and tiles
 */
export type EventWithDetails = Event & {
  teams: TeamWithMembers[];
  tiles: Tile[];
};

/**
 * Response from GET /v2/events
 */
export type EventsListResponse = {
  data: Event[];
  total: number;
  page: number;
  per_page: number;
};

/**
 * Tile with nested tasks, challenges, and trigger information
 */
export type TileWithTasks = Tile & {
  tasks: TaskWithChallenges[];
};

/**
 * Task with nested challenges
 */
export type TaskWithChallenges = Task & {
  challenges: ChallengeWithTrigger[];
};

/**
 * Challenge with trigger information
 */
export type ChallengeWithTrigger = Challenge & {
  trigger: Trigger;
  children?: ChallengeWithTrigger[]; // For parent challenges
};

/**
 * Team with member information
 */
export type TeamWithMembers = Team & {
  members: TeamMember[];
};

/**
 * Tile status with medal level helper
 */
export type TileStatusWithMedal = TileStatus & {
  medal_level: "none" | "bronze" | "silver" | "gold";
};

export type EventProgress = {
  team: Team;
  tiles: TileStatusWithMedal[];
};

/**
 * Challenge status with proofs
 */
export type ChallengeStatusWithProofs = ChallengeStatus & {
  proofs: ChallengeProof[];
};

/**
 * Complete bingo board state for a team
 */
export type BingoBoardState = {
  event: Event;
  team: Team;
  tiles: Array<{
    tile: Tile;
    status: TileStatus | null;
    tasks: Array<{
      task: Task;
      status: TaskStatus | null;
      challenges: Array<{
        challenge: Challenge;
        trigger: Trigger;
        status: ChallengeStatus | null;
        children?: Array<{
          challenge: Challenge;
          trigger: Trigger;
          status: ChallengeStatus | null;
        }>;
      }>;
    }>;
  }>;
};

// Progress-specific types for team progress endpoint

export type TileProgress = Tile & {
  status: {
    id?: string;
    team_id?: string;
    tile_id?: string;
    tasks_completed: number;
    medal_level: MedalLevel;
    created_at?: string;
    updated_at?: string;
  };
  tasks: TaskProgress[];
};

export type TaskProgress = Task & {
  status: {
    id?: string;
    team_id?: string;
    task_id?: string;
    completed: boolean;
    created_at?: string;
    updated_at?: string;
  };
  challenges: ChallengeProgress[];
};

export type ChallengeProgress = Challenge & {
  trigger: Trigger;
  status: {
    id?: string;
    team_id?: string;
    challenge_id?: string;
    quantity: number;
    completed: boolean;
    created_at?: string;
    updated_at?: string;
  };
};

// The return type of GET /v2/teams/<team_id>/progress
export type TeamProgressResponse = TileProgress[];

// ===========================================
// UTILITY TYPES
// ===========================================

export type MedalLevel = "none" | "bronze" | "silver" | "gold";

export type ActionType =
  | "KC"
  | "DROP"
  | "QUEST"
  | "ACHIEVEMENT"
  | "DIARY"
  | "SKILL";
