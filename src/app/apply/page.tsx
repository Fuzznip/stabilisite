import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextAnimate } from "@/components/magicui/text-animate";
import { getAuthUser } from "../../lib/fetch/getAuthUser";
import { redirect } from "next/navigation";
import StabilityClanForm from "./_components/StabilityClanForm";

export default async function ApplyPage() {
  const user = await getAuthUser();
  if (!user?.image) redirect("/login");

  return (
    <div className="w-full h-full flex">
      <Card className="bg-background text-foreground shadow-xl mx-auto mt-12 max-w-lg h-fit px-4 py-2">
        <CardHeader className="pb-2">
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
          <p className="text-base text-muted-foreground">
            Apply to the clan by submitting the form below
          </p>
          <StabilityClanForm />
        </CardContent>
      </Card>
    </div>
  );
}
