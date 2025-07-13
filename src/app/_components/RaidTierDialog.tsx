"use client";

import { useState } from "react";
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
import { Info, Swords } from "lucide-react";
import { Raid } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { submitRaidTier } from "../_actions/submitRaidTier";
import ProofField from "./ProofField";

const raidTierSchema = z.object({
  raid: z.string({
    required_error: "Please select a raid",
  }),
  tier: z.string({
    required_error: "Please select a tier",
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

type RaidTierSchema = z.infer<typeof raidTierSchema>;

export function RaidTierDialog({
  raids,
}: {
  raids: Raid[];
}): React.ReactElement {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRaid, setSelectedRaid] = useState(raids[0]);
  const [selectedTier, setSelectedTier] = useState(raids[0].tiers[0]);

  const defaultForm = {
    raid: selectedRaid.raidName,
    tier: selectedTier.id,
    proof: [],
  };

  const form = useForm<RaidTierSchema>({
    resolver: zodResolver(raidTierSchema),
    defaultValues: defaultForm,
  });

  const onSubmit = (data: RaidTierSchema) => {
    submitRaidTier({ targetRaidTierId: data.tier, proof: data.proof })
      .then(() => {
        toast.success(
          `Your ${selectedRaid.raidName} Tier ${selectedTier.order} application was submitted!`
        );
        form.reset(defaultForm);
      })
      .catch((err) => {
        toast.error(
          `There was an error submitting your ${selectedRaid.raidName} Tier ${selectedTier.order} application: ${err}`,
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
          <Swords className="size-4 mr-1" />
          <span>Raid Tier</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="mb-24 w-[30rem] max-w-full sm:max-h-4/5 overflow-auto">
        <DialogHeader className="mb-2 text-left">
          <DialogTitle className="text-xl">
            Submit Raid Tier Application
          </DialogTitle>
          <DialogDescription className="text-base">
            Submitting for a new tier? Show us your proof and let’s get you
            ranked!
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 text-base"
          >
            <div className="flex items-center gap-8">
              <FormField
                control={form.control}
                name="raid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raid</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(val) => {
                          const newRaid =
                            raids.find((raid) => raid.raidName === val) ||
                            raids[0];
                          setSelectedRaid(newRaid);
                          const newTier =
                            newRaid.tiers.find(
                              (tier) => tier.order === selectedTier.order
                            ) || newRaid.tiers[0];
                          setSelectedTier(newTier);
                          form.setValue("tier", newTier.id);

                          field.onChange(val);
                        }}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select Raid" />
                        </SelectTrigger>
                        <SelectContent>
                          {raids.map((raid) => (
                            <SelectItem
                              key={raid.raidName}
                              value={raid.raidName}
                            >
                              {raid.raidName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raid Tier</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(val) => {
                          setSelectedTier(
                            selectedRaid.tiers.find(
                              (tier) => tier.id === val
                            ) || selectedRaid.tiers[0]
                          );
                          field.onChange(val);
                        }}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue>Tier {selectedTier.order}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {selectedRaid.tiers.map((tier) => (
                            <SelectItem key={tier.id} value={tier.id}>
                              Tier {tier.order}
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
            <Alert className="mt-4">
              <Info />
              <AlertTitle>Requirement</AlertTitle>
              <AlertDescription className="text-foreground font-semibold text-base">
                {selectedTier.requirements}
              </AlertDescription>
            </Alert>
            <FormField
              control={form.control}
              name="proof"
              render={() => (
                <ProofField
                  onFileSelect={(files) => {
                    form.setValue("proof", files);
                  }}
                />
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                className="w-fit ml-auto bg-stability hover:bg-stability/90 text-white"
              >
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
