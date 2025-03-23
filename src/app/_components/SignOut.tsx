import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export function SignOut() {
  return (
    <form
      className="w-full"
      action={async () => {
        "use server";
        await signOut({ redirect: true, redirectTo: "/login" });
      }}
    >
      <Button type="submit" className="w-full">
        Sign Out
      </Button>
    </form>
  );
}
