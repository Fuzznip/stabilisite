import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NewPlayerSignUp from "./_components/NewPlayerSignup";
import { TextAnimate } from "@/components/magicui/text-animate";
import { getAuthUser } from "../_actions/getAuthUser";
import { redirect } from "next/navigation";

export default async function WelcomeRuneScape() {
  const user = await getAuthUser();
  if (user?.runescapeName) redirect("/");
  return (
    <div className="max-w-lg mx-auto mt-20 px-4">
      <Card className="bg-background text-foreground shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2 flex-col sm:flex-row">
            <span>Welcome to Stability,</span>
            <TextAnimate
              animation="blurInUp"
              by="character"
              duration={1}
              className="text-stability"
              once
            >
              {`${user?.name}!` || ""}
            </TextAnimate>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground mb-8">
            Enter your OSRS username to begin your journey with the clan.
          </p>
          <NewPlayerSignUp />
        </CardContent>
      </Card>
    </div>
  );
}
