import { redirect } from "next/navigation";
import { getAuthUser } from "./_actions/getAuthUser";

export default async function HomePage(): Promise<React.ReactElement> {
  const user = await getAuthUser();
  if (!user?.runescapeName) redirect("/register");
  return <>Home page</>;
}
