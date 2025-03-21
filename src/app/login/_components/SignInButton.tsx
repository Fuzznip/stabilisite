import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export default function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("discord", { redirect: true, redirectTo: "/" });
      }}
      className="w-fit mx-auto"
    >
      <Button type="submit">Signin with Discord</Button>
    </form>
  );
}
