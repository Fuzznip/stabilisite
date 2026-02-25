// ===========================================
// BASE MODELS - Direct database representations
// ===========================================

export type Event = {
  id: string;
  name: string;
  start_date: string; // ISO 8601 datetime
  end_date: string; // ISO 8601 datetime
  release_date: string; // ISO 8601 datetime
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
  wiki_id: number | null;
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
  trigger_id: string | null; // null for parent challenges
  require_all: boolean;
  quantity: number | null; // null = repeatable challenge
  value: number;
  count_per_action: number | null;
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

export type ChallengeProof = {
  id: string;
  challenge_status_id: string;
  action_id: string;
  img_path: string | null;
  created_at: string;
};

// ===========================================
// PLAYER TYPE - For action attribution
// ===========================================

export type Player = {
  id: string;
  runescape_name: string;
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
  trigger?: Trigger; // Optional - only present if challenge has a trigger_id
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
  medal_level: MedalLevel;
};

export type EventProgress = {
  team: Team;
  tiles: TileStatusWithMedal[];
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
        trigger?: Trigger;
        status: ChallengeStatus | null;
        children?: Array<{
          challenge: Challenge;
          trigger?: Trigger;
          status: ChallengeStatus | null;
        }>;
      }>;
    }>;
  }>;
};

// ===========================================
// TILE PROGRESS ENDPOINT TYPES
// ===========================================

// Challenge status (team progress on a challenge)
export type ChallengeStatus = {
  challenge_id: string; // UUID
  task_id: string; // UUID - which task this belongs to
  parent_challenge_id: string | null; // UUID - for hierarchical challenges
  quantity: number; // Current progress
  required: number | null; // Required quantity to complete (null = repeatable)
  value: number;
  completed: boolean;
  require_all: boolean; // If true, this is an AND challenge with children
  trigger?: Trigger; // Full trigger details - only present if challenge has a trigger
};

// Response from GET /v2/tiles/:tileId/proofs?team_id=X&task_id=Y
export type TileProofsEntry = {
  id: string;
  img_path: string | null;
  created_at: string; // ISO 8601
  item_name: string | null; // action.name ?? trigger.name
  player_name: string | null; // action.player.runescape_name
  source: string | null;
  quantity: number;
  trigger_type: string | null;
};

export type TileProofsResponse = TileProofsEntry[];

// Task status for tile progress endpoint (simplified)
export type TaskStatusProgress = {
  task_id: string; // UUID
  completed: boolean;
  status_id?: string; // UUID - only present if TaskStatus exists in DB
};

// Team progress on a specific tile
export type TeamProgress = {
  id: string; // UUID
  event_id: string; // UUID
  name: string;
  image_url: string | null;
  points: number;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
  tile_status:
    | TileStatusWithMedal
    | {
        tasks_completed: 0;
        medal_level: "none";
      };
  task_statuses: TaskStatusProgress[];
  challenge_statuses: ChallengeStatus[];
};

// Main response type for GET /v2/tiles/<tile_id>/progress
export type TileProgressResponse = {
  tile: TileWithTasks;
  teams: TeamProgress[];
};

// ===========================================
// TEAM PROGRESS ENDPOINT TYPES
// ===========================================

// The return type of GET /v2/teams/<team_id>/progress
export type TeamProgressResponse = {
  points: number;
  tiles: {
    index: number;
    tasks_completed: 0 | 1 | 2 | 3; // 0=none, 1=bronze, 2=silver, 3=gold
  }[];
};

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
