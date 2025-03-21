import { signOut } from "@/auth";

export function SignOut() {
  return (
    <form
      className="w-full"
      action={async () => {
        "use server";
        await signOut({ redirect: true, redirectTo: "/login" });
      }}
    >
      <button type="submit" className="w-full">
        Sign Out
      </button>
    </form>
  );
}
