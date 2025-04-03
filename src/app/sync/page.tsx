import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlayerSyncForm from "./_components/PlayerSyncForm";
import { TextAnimate } from "@/components/magicui/text-animate";
import { getAuthUser } from "../../lib/fetch/getAuthUser";
import { redirect } from "next/navigation";

export default async function SyncPage() {
  const user = await getAuthUser();
  if (!user?.image) redirect("/login");
  if (user?.runescapeName) redirect(`/profile/${user.discordId}`);

  return (
    <div className="w-full h-full flex">
      <Card className="bg-background text-foreground shadow-xl mx-auto mt-20 max-w-lg h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl flex items-center gap-2 flex-col sm:flex-row">
            <span>Welcome to Stability{!user?.name && "!"}</span>
            {user?.name && (
              <>
                ,{" "}
                <TextAnimate
                  animation="blurInUp"
                  by="character"
                  duration={1}
                  className="text-stability"
                  once
                >
                  {`${user?.name}!` || ""}
                </TextAnimate>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground mb-8">
            Enter your OSRS username to sync with the site
          </p>
          <PlayerSyncForm />
        </CardContent>
      </Card>
    </div>
  );
}
