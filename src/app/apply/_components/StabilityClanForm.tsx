"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useState } from "react";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  heardAbout: z.string().max(100, "Maximum 100 characters"),
  whyJoin: z.string().max(1000, "Maximum 1000 characters"),
  goals: z.string().max(1000, "Maximum 1000 characters"),
});

type FormData = z.infer<typeof formSchema>;
export default function StabilityClanForm() {
  const [applied, setApplied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    console.log(data);
    setApplied(true);
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8 mt-8"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">What Is Your OSRS Username?</Label>
        <Input
          id="username"
          {...register("username")}
          placeholder="Zezima"
          className="bg-background"
        />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="heardAbout">How Did You Hear About Us?</Label>
        <Textarea
          id="heardAbout"
          className="bg-background"
          {...register("heardAbout")}
          placeholder="Reddit/OSRS discord/Word of Mouth"
          maxLength={100}
        />
        {errors.heardAbout && (
          <p className="text-sm text-red-500">{errors.heardAbout.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="whyJoin">Why Do You Want To Join?</Label>
        <Textarea
          id="whyJoin"
          className="bg-background"
          {...register("whyJoin")}
          placeholder="I want to learn to PvM"
          maxLength={1000}
        />
        {errors.whyJoin && (
          <p className="text-sm text-red-500">{errors.whyJoin.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="goals">What Are Your In-Game Goals?</Label>
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
