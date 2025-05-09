"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";
import { submitClanApplication } from "../_actions/submitClanApplication";

const formSchema = z.object({
  runescapeName: z
    .string()
    .min(1, "Username is required")
    .max(20, "Maximum 20 characters"),
  referral: z.string().max(100, "Maximum 100 characters"),
  reason: z.string().max(1000, "Maximum 1000 characters"),
  goals: z.string().max(1000, "Maximum 1000 characters"),
});

type FormData = z.infer<typeof formSchema>;
export default function StabilityClanForm() {
  const [applied, setApplied] = useState(false);
  return applied ? <AppliedMessage /> : <ClanForm setApplied={setApplied} />;
}

function ClanForm({
  setApplied,
}: {
  setApplied: (applied: boolean) => void;
}): React.ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    submitClanApplication(data);
    setApplied(true);
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8 mt-8"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">What is your OSRS username?</Label>
        <Input
          id="username"
          {...register("runescapeName")}
          placeholder="Zezima"
          className="bg-background"
        />
        {errors.runescapeName && (
          <p className="text-sm text-red-500">{errors.runescapeName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="referral">How did you hear about us?</Label>
        <Textarea
          id="referral"
          className="bg-background"
          {...register("referral")}
          placeholder="Reddit/OSRS discord/Word of Mouth"
          maxLength={100}
        />
        {errors.referral && (
          <p className="text-sm text-red-500">{errors.referral.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="whyJoin">Why do you want to join?</Label>
        <Textarea
          id="whyJoin"
          className="bg-background"
          {...register("reason")}
          placeholder="I want to learn to PvM"
          maxLength={1000}
        />
        {errors.reason && (
          <p className="text-sm text-red-500">{errors.reason.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="goals">What are your in-game goals?</Label>
        <Textarea
          id="goals"
          className="bg-background"
          {...register("goals")}
          placeholder="Maxing my account/Making 10b gp"
          maxLength={1000}
        />
        {errors.goals && (
          <p className="text-sm text-red-500">{errors.goals.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-24 ml-auto bg-stability text-white hover:bg-stability/90"
      >
        Submit
      </Button>
    </form>
  );
}

function AppliedMessage(): React.ReactElement {
  return (
    <div className="flex flex-col">
      <p className="mt-8 text-lg">
        Thank you for applying to Stability! While your application is being
        reviewed, feel free to explore our website!
      </p>
      <Button
        className="px-4 bg-stability text-white w-fit ml-auto hover:bg-stability/90"
        asChild
      >
        <Link href="/">Continue</Link>
      </Button>
    </div>
  );
}
