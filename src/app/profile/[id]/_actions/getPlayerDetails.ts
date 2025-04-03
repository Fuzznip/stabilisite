import { getAuthUser } from "@/lib/fetch/getAuthUser";
import { PlayerDetails, WOMClient } from "@wise-old-man/utils";

const client = new WOMClient();

export default async function getPlayerDetails(): Promise<
  PlayerDetails | undefined
> {
  const user = await getAuthUser();
  if (!user?.runescapeName) return undefined;
  return await client.players.getPlayerDetails(user.runescapeName);
}
