import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDiaryApplications } from "@/lib/db/diary";
import { getApplications } from "@/lib/fetch/getApplications";
import {
  Application,
  DiaryApplication,
  RaidTierApplication,
  RankApplication,
} from "@/lib/types";
import { differenceInCalendarDays, formatDistanceToNow } from "date-fns";
import acceptApplication from "./_actions/acceptApplication";
import rejectApplication from "./_actions/rejectApplication";
import {
  CheckCircle,
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import {
  formatDateTime,
  getCAForShorthand,
  getScaleDisplay,
} from "@/lib/utils";
import { getAuthUser } from "@/lib/fetch/getAuthUser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import rejectDiaryApplication from "./_actions/rejectDiaryApplication";
import acceptDiaryApplication from "./_actions/acceptDiaryApplication";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getRaidTierApplications } from "@/lib/db/raidTier";
import { getRaids } from "@/lib/fetch/getRaids";
import rejectRaidTierApplication from "./_actions/rejectRaidTierApplication";
import acceptRaidTierApplication from "./_actions/acceptRaidTierApplication";
import RankDisplay from "@/components/RankDisplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import rejectRankApplication from "./_actions/rejectRankApplication";
import acceptRankApplication from "./_actions/acceptRankApplication";
import { getRankApplications } from "@/lib/db/rank";
import { getRanks } from "@/lib/fetch/getRanks";
import getUser from "@/lib/fetch/getUser";

export default async function ApplicationPage(): Promise<React.ReactElement> {
  const applications = await getApplications();
  const diaryApplications = await getDiaryApplications();
  const raidTierApplications = await getRaidTierApplications();
  const rankApplications = await getRankApplications();
  const user = await getAuthUser();

  if (!user?.isAdmin) {
    return (
      <Alert className="w-1/2 mx-auto bg-muted">
        <TriangleAlert className="size-4" />
        <AlertTitle>Page not found</AlertTitle>
        <AlertDescription>What are you trying to do?</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-8 mx-auto sm:mx-0">
      <h1 className="text-3xl font-bold">Applications</h1>
      <Tabs defaultValue="clan">
        <TabsList className="py-1 h-auto mb-4 flex items-center gap-4 w-fit">
          <TabsTrigger value="clan" className="flex items-center text-lg">
            <span>Clan</span>
            <Badge className="ml-2 bg-foreground text-background">
              {
                applications.filter(
                  (application) => application.status === "Pending"
                ).length
              }
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="diary" className="flex items-center text-lg">
            <span>Diary</span>
            <Badge className="ml-2 bg-foreground text-background">
              {
                diaryApplications.filter(
                  (application) => application.status === "Pending"
                ).length
              }
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="raids" className="flex items-center text-lg">
            <span>Raid Tier</span>
            <Badge className="ml-2 bg-foreground text-background">
              {
                raidTierApplications.filter(
                  (application) => application.status === "Pending"
                ).length
              }
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="ranks" className="flex items-center text-lg">
            <span>Rank</span>
            <Badge className="ml-2 bg-foreground text-background">
              {
                rankApplications.filter(
                  (application) => application.status === "Pending"
                ).length
              }
            </Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="clan">
          {applications.length > 0 ? (
            <ClanApplications applications={sortApplications(applications)} />
          ) : (
            <Card className="w-fit text-2xl px-8 pt-6">
              <CardContent>No current applications</CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="diary">
          {diaryApplications.length > 0 ? (
            <DiaryApplications
              diaryApplications={sortApplications(diaryApplications)}
            />
          ) : (
            <Card className="w-fit text-2xl px-8 pt-6">
              <CardContent>No current applications</CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="raids">
          {diaryApplications.length > 0 ? (
            <RaidTierApplications
              applications={sortApplications(raidTierApplications)}
            />
          ) : (
            <Card className="w-fit text-2xl px-8 pt-6">
              <CardContent>No current applications</CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="ranks">
          {diaryApplications.length > 0 ? (
            <RankApplications
              applications={sortApplications(rankApplications)}
            />
          ) : (
            <Card className="w-fit text-2xl px-8 pt-6">
              <CardContent>No current applications</CardContent>
            </Card>
          )}
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
    <ul className="flex items-center flex-wrap gap-8">
      {diaryApplications.map((application) => {
        const timeAgo = formatDistanceToNow(application.date || new Date(), {
          addSuffix: true,
        });
        const scale = application.shorthand?.replace(/\D/g, "");
        const img = (
          <Image
            src={
              application.proof && application.proof !== "string"
                ? application.proof
                : ""
            }
            alt={`${application.shorthand} proof`}
            fill
            className="object-contain"
          />
        );
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
              <div className="flex flex-row items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-muted-foreground mb-1">Diary</span>
                  <span className="text-foreground">
                    {application.name}{" "}
                    {getDiaryNameApplicationDetail(application)}
                  </span>
                </div>
                {scale && application.time && (
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-1">Scale</span>
                    <span className="text-foreground">
                      {getScaleDisplay(scale)}
                    </span>
                  </div>
                )}
              </div>
              {application.time && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground mb-1">Duration</span>
                  <span className="text-foreground">{application.time}</span>
                </div>
              )}
              {application.party?.length && application.party?.length > 1 && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground mb-1">Party</span>
                  <span className="text-foreground flex flex-col">
                    {application.party?.map((member, index) => (
                      <span
                        key={`${application.id}-${index}`}
                        className="capitalize"
                      >
                        {member}
                      </span>
                    ))}
                  </span>
                </div>
              )}
              {application.proof && application.proof !== "string" && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground mb-1">Proof</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="border rounded-lg relative w-full h-48 hover:cursor-pointer">
                        {img}
                      </div>
                    </DialogTrigger>
                    <DialogContent className="w-fit h-fit max-w-[90vw] sm:max-w-[90vw]">
                      <DialogHeader>
                        <DialogTitle>Diary Proof</DialogTitle>
                      </DialogHeader>
                      <div className="relative h-[600px] max-h-[90vh] w-[900px] max-w-[80vw]">
                        {img}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
            {application.status === "Pending" && (
              <div className="w-fit flex items-center gap-2 ml-auto mt-2 h-10">
                <form
                  action={rejectDiaryApplication.bind(
                    null,
                    application.id || ""
                  )}
                >
                  <Button
                    className="text-red-500 border-red-500 hover:cursor-pointer"
                    variant="outline"
                  >
                    Reject
                  </Button>
                </form>
                <form
                  action={acceptDiaryApplication.bind(
                    null,
                    application.id || ""
                  )}
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
                {application.verdictTimestamp && (
                  <span>Accepted on {formatDateTime(new Date())}</span>
                )}
              </div>
            )}
            {application.status === "Rejected" && (
              <div className="w-fit ml-auto text-red-500/80 flex items-center gap-1 mt-2 text-sm h-10">
                <XCircle className="size-4" />{" "}
                {application.verdictTimestamp && (
                  <span>Rejected on {formatDateTime(new Date())}</span>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </ul>
  );
}

async function RaidTierApplications({
  applications,
}: {
  applications: RaidTierApplication[];
}): Promise<React.ReactElement> {
  const raids = await getRaids();
  return (
    <ul className="flex items-center flex-wrap gap-8">
      {applications.map((application) => {
        const timeAgo = formatDistanceToNow(application.date || new Date(), {
          addSuffix: true,
        });

        const raid = raids.find((raid) =>
          raid?.tiers
            .map((tier) => tier.id)
            .includes(application.targetRaidTierId || "")
        );

        const tier = raid?.tiers.find(
          (tier) => tier.id === application.targetRaidTierId
        );
        const img = (
          <Image
            src={
              application.proof && application.proof !== "string"
                ? application.proof
                : ""
            }
            alt={`${raid?.raidName} Tier ${tier?.order} proof for ${application.runescapeName}`}
            fill
            className="object-contain"
          />
        );
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
              <div className="flex flex-row items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-muted-foreground mb-1">Raid</span>
                  <span className="text-foreground">{raid?.raidName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground mb-1">Tier</span>
                  <span className="text-foreground">{tier?.order}</span>
                </div>
              </div>
              {application.proof && application.proof !== "string" && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground mb-1">Proof</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="border rounded-lg relative w-full h-48 hover:cursor-pointer">
                        {img}
                      </div>
                    </DialogTrigger>
                    <DialogContent className="w-fit h-fit max-w-[90vw] sm:max-w-[90vw]">
                      <DialogHeader>
                        <DialogTitle>Diary Proof</DialogTitle>
                      </DialogHeader>
                      <div className="relative h-[600px] max-h-[90vh] w-[900px] max-w-[80vw]">
                        {img}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
            {application.status === "Pending" && (
              <div className="w-fit flex items-center gap-2 ml-auto mt-2 h-10">
                <form
                  action={rejectRaidTierApplication.bind(
                    null,
                    application.id || ""
                  )}
                >
                  <Button
                    className="text-red-500 border-red-500 hover:cursor-pointer"
                    variant="outline"
                  >
                    Reject
                  </Button>
                </form>
                <form
                  action={acceptRaidTierApplication.bind(
                    null,
                    application.id || ""
                  )}
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
                <CheckCircle className="size-4" />
                {application.verdictDate && (
                  <span>Accepted on {formatDateTime(new Date())}</span>
                )}
              </div>
            )}
            {application.status === "Rejected" && (
              <div className="w-fit ml-auto text-red-500/80 flex items-center gap-1 mt-2 text-sm h-10">
                <XCircle className="size-4" />
                {application.verdictDate && (
                  <span>Rejected on {formatDateTime(new Date())}</span>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </ul>
  );
}
async function RankApplications({
  applications,
}: {
  applications: RankApplication[];
}): Promise<React.ReactElement> {
  const ranks = await getRanks();
  return (
    <ul className="flex items-center flex-wrap gap-8">
      {applications.map(async (application) => {
        const timeAgo = formatDistanceToNow(application.date || new Date(), {
          addSuffix: true,
        });
        const newRank = ranks.find(
          (rank) => rank.rankName === application.rank
        )!;
        const user = await getUser(application.userId!);
        const daysInClan = differenceInCalendarDays(
          new Date(),
          user?.joinDate || new Date()
        );
        const clanPoints = user?.rankPoints || 0;
        const proofImages =
          application.proof?.map((proof, index) => (
            <Image
              key={`${application.userId}-${application.rank}-${index}`}
              src={proof && proof !== "string" ? proof : ""}
              alt={`Proof image ${index} for ${application.runescapeName}'s ${application.rank} application`}
              fill
              className="object-contain"
            />
          )) || [];
        return (
          <Card
            key={application.id}
            className="border px-4 pt-2 pb-4 rounded-lg flex flex-col w-[30rem] h-fit"
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
              <div className="flex flex-row items-center gap-8 w-fit mb-4">
                <div className="flex flex-col">
                  <span className="text-muted-foreground mb-1">New Rank</span>
                  <RankDisplay rank={application.rank} />
                </div>
              </div>
              <div className="flex flex-col mr-4">
                <span className="text-sm">Requirements</span>
                <span className="text-sm text-muted-foreground">
                  All requirements for previous ranks must be met as well
                </span>
                {newRank?.rankMinimumDays > 0 && (
                  <Alert className="mt-2">
                    <Info />
                    <AlertTitle>Time in Clan</AlertTitle>
                    <AlertDescription className="text-foreground font-semibold text-base flex justify-between">
                      {newRank.rankMinimumDays} days
                    </AlertDescription>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 h-full w-fit flex items-center text-base font-semibold">
                      {daysInClan} days
                      {daysInClan >= newRank.rankMinimumDays ? (
                        <CircleCheck className="ml-2 text-green-500 font-extrabold size-8" />
                      ) : (
                        <CircleX className="ml-2 text-red-500 font-extrabold size-8" />
                      )}
                    </div>
                  </Alert>
                )}
                {newRank.rankMinimumPoints > 0 && (
                  <Alert className="mt-2">
                    <Info />
                    <AlertTitle>Clan Points</AlertTitle>
                    <AlertDescription className="text-foreground font-semibold text-base">
                      {newRank.rankMinimumPoints.toLocaleString()} points
                    </AlertDescription>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 h-full w-fit flex items-center text-base font-semibold">
                      {Math.floor(clanPoints).toLocaleString()} points
                      {Math.floor(clanPoints) >= newRank.rankMinimumPoints ? (
                        <CircleCheck className="ml-2 text-green-500 font-extrabold size-8" />
                      ) : (
                        <CircleX className="ml-2 text-red-500 font-extrabold size-8" />
                      )}
                    </div>
                  </Alert>
                )}
                {newRank.rankRequirements.length > 0 && (
                  <Alert className="mt-2">
                    <Info />
                    <AlertTitle>Account</AlertTitle>
                    <AlertDescription className="text-foreground font-semibold text-base">
                      <ul className="list-inside list-['-_']">
                        {newRank.rankRequirements.map((requirement) => (
                          <li key={requirement}>{requirement}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              {application.proof && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground mb-1">Proof</span>
                  <Carousel className="relative w-72 h-48 mx-auto px-1 mb-4">
                    <CarouselContent>
                      {proofImages.map((img, index) => (
                        <CarouselItem key={index}>
                          <Dialog>
                            <DialogTrigger asChild>
                              <div className="border rounded-lg relative w-full h-48 hover:cursor-pointer">
                                {img}
                              </div>
                            </DialogTrigger>
                            <DialogContent className="w-fit h-fit max-w-[90vw] sm:max-w-[90vw]">
                              <DialogHeader>
                                <DialogTitle>Diary Proof</DialogTitle>
                              </DialogHeader>
                              <div className="relative h-[600px] max-h-[90vh] w-[900px] max-w-[80vw]">
                                {img}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious type="button" />
                    <CarouselNext type="button" />
                  </Carousel>
                </div>
              )}
            </div>
            {application.status === "Pending" && (
              <div className="w-fit flex items-center gap-2 ml-auto mt-2 h-10">
                <form
                  action={rejectRankApplication.bind(
                    null,
                    application.id || ""
                  )}
                >
                  <Button
                    className="text-red-500 border-red-500 hover:cursor-pointer"
                    variant="outline"
                  >
                    Reject
                  </Button>
                </form>
                <form
                  action={acceptRankApplication.bind(
                    null,
                    application.id || ""
                  )}
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
                <CheckCircle className="size-4" />
                {application.verdictDate && (
                  <span>Accepted on {formatDateTime(new Date())}</span>
                )}
              </div>
            )}
            {application.status === "Rejected" && (
              <div className="w-fit ml-auto text-red-500/80 flex items-center gap-1 mt-2 text-sm h-10">
                <XCircle className="size-4" />
                {application.verdictDate && (
                  <span>Rejected on {formatDateTime(new Date())}</span>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </ul>
  );
}

function sortApplications(
  applications: { status?: string; date?: Date; verdictDate?: Date }[]
): { status?: string; date?: Date; verdictDate?: Date }[] {
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

function getDiaryNameApplicationDetail(application: DiaryApplication): string {
  if (application.name === "Combat Achievements") {
    return `(${getCAForShorthand(application.shorthand || "")})`;
  }

  return "";
}
