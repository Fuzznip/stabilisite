import { SplitForm, User } from "../types";

export async function submitSplitEntry(
  user: User | null,
  splitForm: SplitForm,
  fileUrl: string
): Promise<void> {
  const splitRequest = {
    user_id: user?.discordId,
    item_name: splitForm.item,
    item_price: splitForm.price,
    group_size: splitForm.teamSize,
    screenshot_link: fileUrl,
  };
  const response = await fetch(`${process.env.API_URL}/splits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(splitRequest),
  });
  if (!response.ok) throw await response.text();
  return;
}
