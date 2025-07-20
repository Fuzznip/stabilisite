"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ChartBarIncreasing, CircleCheck, CircleX, Info } from "lucide-react";
import { Rank, User } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ProofField from "./ProofField";
import { submitRank } from "../_actions/submitRank";
import { differenceInCalendarDays } from "date-fns";
import RankDisplay from "@/components/RankDisplay";

const rankSchema = z.object({
  rank: z.string({
    required_error: "Please select a rank",
  }),
  proof: z
    .any()
    .refine(
      (files) =>
        Array.isArray(files) &&
        files.length > 0 &&
        files.every((file) => file instanceof File && file.size > 0),
      {
        message: "Please upload at least one valid image file",
      }
    ),
});

type RaidTierSchema = z.infer<typeof rankSchema>;

export function RankDialog({
  ranks,
  user,
}: {
  ranks: Rank[];
  user: User | null;
}): React.ReactElement {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRank, setSelectedRank] = useState<Rank>(ranks[0]);
  const daysInClan = differenceInCalendarDays(
    new Date(),
    user?.joinDate || new Date()
  );
  const clanPoints = user?.rankPoints || 0;
  const defaultForm = {
    rank: selectedRank.rankName,
    proof: [],
  };

  const form = useForm<RaidTierSchema>({
    resolver: zodResolver(rankSchema),
    defaultValues: defaultForm,
  });

  const onSubmit = (data: RaidTierSchema) => {
    submitRank({
      rank: selectedRank.rankName,
      rankOrder: selectedRank.rankOrder,
      proof: data.proof,
    })
      .then(() => {
        toast.success(
          `Your ${selectedRank.rankName} rank application was submitted!`
        );
        form.reset(defaultForm);
      })
      .catch((err) => {
        toast.error(
          `There was an error submitting your ${selectedRank.rankName} rank application: ${err}`,
          { duration: 10000 }
        );
        form.reset(defaultForm);
      });

    setDialogOpen(false);
    form.reset();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start px-6">
          <ChartBarIncreasing className="size-4 mr-1" />
          <span>Rank</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="mb-24 w-[30rem] sm:w-1/2 max-w-full lg:max-w-2xl sm:max-h-4/5 overflow-auto">
        <DialogHeader className="mb-2 text-left">
          <DialogTitle className="text-xl">Submit Rank Application</DialogTitle>
          <DialogDescription className="text-base">
            Submitting for a new rank? Show us your proof and let’s get you
            updated!
          </DialogDescription>
        </DialogHeader>
        {ranks.length > 0 ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4 text-base"
            >
              <div className="flex items-center gap-8 justify-between">
                <div className="flex flex-col items-start gap-2 h-full">
                  <span className="text-sm leading-none mb-[5px]">
                    Current Rank
                  </span>
                  <RankDisplay rank={user?.rank} />
                </div>
                <FormField
                  control={form.control}
                  name="rank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Rank</FormLabel>
                      <FormControl>
                        <Select
                          value={selectedRank.id}
                          defaultValue={field.value}
                          onValueChange={(rankId) =>
                            setSelectedRank(
                              ranks.find((rank) => rank.id === rankId) ||
                                ranks[0]
                            )
                          }
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select Raid" />
                          </SelectTrigger>
                          <SelectContent>
                            {ranks.map((rank) => (
                              <SelectItem key={rank.id} value={rank.id}>
                                <RankDisplay rank={rank.rankName} />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm">Requirements</span>
                <span className="text-sm text-muted-foreground">
                  All requirements for previous ranks must be met as well
                </span>
                {selectedRank.rankMinimumDays > 0 && (
                  <Alert className="mt-2">
                    <Info />
                    <AlertTitle>Time in Clan</AlertTitle>
                    <AlertDescription className="text-foreground font-semibold text-base flex justify-between">
                      {selectedRank.rankMinimumDays} days
                    </AlertDescription>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 h-full w-fit flex items-center text-base font-semibold">
                      {daysInClan} days
                      {daysInClan >= selectedRank.rankMinimumDays ? (
                        <CircleCheck className="ml-2 text-green-500 font-extrabold size-8" />
                      ) : (
                        <CircleX className="ml-2 text-red-500 font-extrabold size-8" />
                      )}
                    </div>
                  </Alert>
                )}
                {selectedRank.rankMinimumPoints > 0 && (
                  <Alert className="mt-2">
                    <Info />
                    <AlertTitle>Clan Points</AlertTitle>
                    <AlertDescription className="text-foreground font-semibold text-base">
                      {selectedRank.rankMinimumPoints.toLocaleString()} points
                    </AlertDescription>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 h-full w-fit flex items-center text-base font-semibold">
                      {Math.floor(clanPoints).toLocaleString()} points
                      {Math.floor(clanPoints) >=
                      selectedRank.rankMinimumPoints ? (
                        <CircleCheck className="ml-2 text-green-500 font-extrabold size-8" />
                      ) : (
                        <CircleX className="ml-2 text-red-500 font-extrabold size-8" />
                      )}
                    </div>
                  </Alert>
                )}
                {selectedRank.rankRequirements.length > 0 && (
                  <Alert className="mt-2">
                    <Info />
                    <AlertTitle>Account</AlertTitle>
                    <AlertDescription className="text-foreground font-semibold text-base">
                      <ul className="list-inside list-['-_']">
                        {selectedRank.rankRequirements.map((requirement) => (
                          <li key={requirement}>{requirement}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <FormField
                control={form.control}
                name="proof"
                render={() => (
                  <ProofField
                    onFileSelect={(files) => {
                      form.setValue("proof", files);
                    }}
                    allowMultiple={true}
                  />
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  className="w-fit ml-auto bg-stability hover:bg-stability/90 text-white"
                  disabled={
                    clanPoints < selectedRank.rankMinimumPoints ||
                    daysInClan < selectedRank.rankMinimumDays
                  }
                >
                  Submit
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="flex w-fit mx-auto my-4">
            You have already obtained the highest rank in the clan.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
