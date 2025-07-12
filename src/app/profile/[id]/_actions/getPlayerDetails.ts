import { PlayerDetails, WOMClient } from "@wise-old-man/utils";

const client = new WOMClient();

export default async function getPlayerDetails(
  runescapeName: string
): Promise<PlayerDetails | undefined> {
  try {
    return await client.players.getPlayerDetails(runescapeName);
  } catch {
    throw Error("No Player found");
  }
}
