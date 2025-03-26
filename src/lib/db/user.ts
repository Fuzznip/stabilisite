import { User as NextAuthUser } from "next-auth";
import { UserResponse } from "../types";

export async function getStoredUser(
  authUser: NextAuthUser
): Promise<UserResponse | undefined> {
  const response = await fetch(`${process.env.API_URL}/users/${authUser.id}`);
  if (!response.ok) return undefined;
  return response.json();
}

export async function storeUser(
  authUser: NextAuthUser,
  username: string
): Promise<UserResponse> {
  return (
    await fetch(`${process.env.API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        discord_id: authUser.id,
        runescape_name: username,
        rank: "",
        progression_data: {},
      }),
    })
  ).json();
}

export async function deleteUser(id: string): Promise<boolean> {
  return (
    await fetch(`${process.env.API_URL}/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).ok;
}
