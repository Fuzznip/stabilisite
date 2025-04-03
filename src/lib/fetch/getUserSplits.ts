import { Split, SplitResponse, User } from "../types";

export async function getUserSplits(user: User | null): Promise<Split[]> {
  return fetch(`${process.env.API_URL}/users/${user?.discordId || ""}/splits`)
    .then((response) => response.json())
    .then((splits) =>
      splits.map((split: SplitResponse) => ({
        id: split.id,
        userId: split.user_id,
        itemName: split.item_name,
        itemPrice: Number(split.item_price),
        splitContribution: Number(split.split_contribution),
        groupSize: Number(split.group_size),
        screenshotLink: split.screenshot_link,
        date: new Date(split.timestamp),
      }))
    );
}
