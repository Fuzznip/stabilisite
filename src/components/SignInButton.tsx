import { signIn } from "@/auth";

export default function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("discord", { redirect: true, redirectTo: "/" });
      }}
    >
      <button type="submit">Signin with Discord</button>
    </form>
  );
}
