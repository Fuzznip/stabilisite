import { PlayerDetails, WOMClient } from "@wise-old-man/utils";

const client = new WOMClient();

export default async function getPlayerDetails(
  runescapeName: string
): Promise<PlayerDetails | undefined> {
  return await client.players.getPlayerDetails(runescapeName);
}
