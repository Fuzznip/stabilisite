import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import DiscordIcon from "./DiscordIcon";

export default function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("discord", { redirect: true, redirectTo: "/apply" });
      }}
      className="w-fit mx-auto"
    >
      <Button
        type="submit"
        className="bg-discord text-white hover:bg-discord/90 active:bg-discord/80 hover:cursor-pointer"
      >
        <DiscordIcon /> Connect with Discord
      </Button>
    </form>
  );
}
