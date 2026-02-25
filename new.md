# Backend API Changes — Summary

## 1. Team progress endpoint (`GET /v2/teams/:teamId/progress`)

**Old response**: `TileProgress[]` — a flat array of full tile objects with nested tasks, challenges, and proofs.

**New response**:
```ts
{
  points: number;
  tiles: {
    index: number;
    tasks_completed: 0 | 1 | 2 | 3; // 0=none, 1=bronze, 2=silver, 3=gold
  }[];
}
```

**Frontend changes**:
- `TeamProgressResponse` type updated in `src/lib/types/v2.tsx`
- `BingoClientWrapper` now passes `data?.tiles` to `BingoBoard`
- `BingoBoard` derives medal image from `tasks_completed` directly (no more `medal_level` string)
- Old `TileProgress` / `TaskProgress` / `ChallengeProgress` types removed

---

## 2. Tile progress endpoint (`GET /v2/tiles/:tileId/progress`)

**Change**: `ChallengeStatus` no longer includes `proofs`. The `ProofAction` and `ChallengeStatusProof` types have been removed.

**New `ChallengeStatus`**:
```ts
{
  challenge_id, task_id, parent_challenge_id,
  quantity, required, value, completed, require_all,
  trigger?: Trigger
}
```

---

## 3. New proofs endpoint (`GET /v2/tiles/:tileId/proofs?team_id=X&task_id=Y`)

Proofs are now fetched lazily — only when the user opens the proof dialog on the tile detail page.

**Response type** (`TileProofsEntry[]`):
```ts
{
  id: string;
  img_path: string | null;
  created_at: string;
  item_name: string | null;   // action.name ?? trigger.name
  player_name: string | null; // action.player.runescape_name
  source: string | null;
  quantity: number;
  trigger_type: string | null;
}
```

**Frontend changes**:
- New Next.js proxy route at `src/app/api/bingo/tile/[tileId]/proofs/route.ts`
- `TeamTaskProgress` in `TilePage.tsx` fetches proofs on first Eye button click (cached per component instance)
- `triggerType` (used to choose PlayerBreakdown vs ProofImage dialog) is now derived from `challenge_statuses[].trigger.type` — no longer requires proofs to be loaded
- `ProofImageDialog` and `PlayerBreakdownDialog` updated to support controlled mode (`open`, `onOpenChange`, `isLoading` props) — dialogs show a spinner while proofs are fetching
