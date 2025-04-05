import { Split, SplitResponse, User } from "../types";

export async function getSplits(user?: User | null): Promise<Split[]> {
  const endpoint = user ? `users/${user.discordId}/splits` : "splits";
  return fetch(`${process.env.API_URL}/${endpoint}`)
    .then((response) => response.json())
    .then((splits) =>
      splits.map((split: SplitResponse) => ({
        id: split.id,
        userId: split.user_id,
        itemId: split.item_id,
        itemName: split.item_name,
        itemPrice: Number(split.item_price),
        itemImg: `https://oldschool.runescape.wiki/images/${encodeURIComponent(
          split.item_name.replace(/ /g, "_")
        )}.png`,
        splitContribution: Number(split.split_contribution),
        groupSize: Number(split.group_size),
        screenshotLink: split.screenshot_link,
        date: new Date(split.timestamp),
      }))
    );
}
