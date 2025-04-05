import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDiaryApplications } from "@/lib/db/diary";
import { getApplications } from "@/lib/fetch/getApplications";
import { Application, DiaryApplication } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import acceptApplication from "./_actions/acceptApplication";
import rejectApplication from "./_actions/rejectApplication";
import { CheckCircle, XCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function ApplicationPage(): Promise<React.ReactElement> {
  const applications = await getApplications();
  const diaryApplications = await getDiaryApplications();

  return (
    <div className="flex flex-col gap-8 mx-auto sm:mx-0">
      <h1 className="text-3xl font-bold">Applications</h1>
      <Tabs defaultValue="clan">
        <TabsList className="py-1 h-auto mb-4">
          <TabsTrigger value="clan" className="flex items-center text-lg">
            <span>Clan Applications</span>
            <Badge className="ml-2 bg-foreground text-background">
              {
                applications.filter(
                  (application) => application.status === "Pending"
                ).length
              }
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="diary" className="flex items-center text-lg">
            <span>Diary Applications</span>
            <Badge className="ml-2 bg-foreground text-background">
              {
                diaryApplications.filter(
                  (application) => application.status === "Pending"
                ).length
              }
            </Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="clan">
          <ClanApplications applications={sortApplications(applications)} />
        </TabsContent>
        <TabsContent value="diary">
          <DiaryApplications diaryApplications={diaryApplications} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ClanApplications({
  applications,
}: {
  applications: Application[];
}): React.ReactElement {
  return (
    <ul className="flex items-center flex-wrap gap-8">
      {applications.map((application) => {
        const timeAgo = formatDistanceToNow(application.date || new Date(), {
          addSuffix: true,
        });
        return (
          <Card
            key={application.id}
            className="border px-4 pt-2 pb-4 rounded-lg flex flex-col w-96 h-fit"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-lg">
                {application.runescapeName}
              </span>
              <span className="text-lg text-muted-foreground w-fit">
                {timeAgo}
              </span>
            </div>
            <div className="overflow-auto flex flex-col gap-4 h-[24rem]">
              <div className="flex flex-col">
                <span className="text-muted-foreground mb-1">
                  What is your OSRS Username?
                </span>
                <span className="text-foreground">
                  {application.runescapeName}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground mb-1">
                  How did you hear about us?
                </span>
                <span className="text-foreground">{application.referral}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground mb-1">
                  Why do you want to join?
                </span>
                <span className="text-foreground">{application.reason}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground mb-1">
                  What are your in-game goals?
                </span>
                <span className="text-foreground">{application.goals}</span>
              </div>
            </div>
            {application.status === "Pending" && (
              <div className="w-fit flex items-center gap-2 ml-auto mt-2 h-10">
                <form
                  action={rejectApplication.bind(null, application.id || "")}
                >
                  <Button
                    className="text-red-500 border-red-500 hover:cursor-pointer"
                    variant="outline"
                  >
                    Reject
                  </Button>
                </form>
                <form
                  action={acceptApplication.bind(null, application.id || "")}
                >
                  <Button
                    className="text-green-500 border-green-500 hover:cursor-pointer"
                    variant="outline"
                  >
                    Accept
                  </Button>
                </form>
              </div>
            )}

            {application.status === "Accepted" && (
              <div className="w-fit ml-auto text-green-500/80 flex items-center gap-1 mt-2 text-sm h-10">
                <CheckCircle className="size-4" />{" "}
                {application.verdictDate && (
                  <span>
                    Accepted on {formatDateTime(application.verdictDate)}
                  </span>
                )}
              </div>
            )}
            {application.status === "Rejected" && (
              <div className="w-fit ml-auto text-red-500/80 flex items-center gap-1 mt-2 text-sm h-10">
                <XCircle className="size-4" />{" "}
                {application.verdictDate && (
                  <span>
                    Rejected on {formatDateTime(application.verdictDate)}
                  </span>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </ul>
  );
}

function DiaryApplications({
  diaryApplications,
}: {
  diaryApplications: DiaryApplication[];
}): React.ReactElement {
  return (
    <ul>
      {diaryApplications.map((application) => (
        <Card key={application.id}>{application.party}</Card>
      ))}
    </ul>
  );
}

function sortApplications(applications: Application[]): Application[] {
  const apps = applications.sort((a, b) => {
    const aIsPending = a.status === "Pending";
    const bIsPending = b.status === "Pending";

    if (aIsPending && !bIsPending) return -1;
    if (!aIsPending && bIsPending) return 1;

    const aDate = a.date?.getTime() ?? 0;
    const bDate = b.date?.getTime() ?? 0;

    if (aIsPending && bIsPending) {
      if (aDate !== bDate) return aDate - bDate;
      const aVerdict = a.verdictDate?.getTime() ?? 0;
      const bVerdict = b.verdictDate?.getTime() ?? 0;
      return bVerdict - aVerdict;
    }

    if (aDate !== bDate) return bDate - aDate;

    const aVerdict = a.verdictDate?.getTime() ?? 0;
    const bVerdict = b.verdictDate?.getTime() ?? 0;
    return bVerdict - aVerdict;
  });

  return apps;
}
