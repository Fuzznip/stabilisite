import Image from "next/image";
import SignInButton from "./_components/SignInButton";
import { getAuthUser } from "../../lib/fetch/getAuthUser";
import { redirect } from "next/navigation";

export default async function LoginPage(): Promise<React.ReactElement> {
  const user = await getAuthUser();
  if (user?.runescapeName) redirect(`/profile/${user.discordId}`);
  return (
    <div className="h-full m-auto w-1/2 flex flex-col mt-20">
      <div className="w-auto h-20 relative">
        <Image
          src={"/banner.png"}
          alt="Stability Banner"
          fill
          sizes="100%"
          className="object-contain"
        />
      </div>
      <h1 className="text-3xl mx-auto mb-8 mt-2 text-center">
        Welcome to the Stability OSRS Clan website!
      </h1>
      <SignInButton />
    </div>
  );
}
