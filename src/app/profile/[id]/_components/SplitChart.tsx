"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CartesianGrid,
  XAxis,
  Line,
  LineChart,
  YAxis,
  TooltipProps,
} from "recharts";
import Image from "next/image";
import { User } from "next-auth";

export default function SplitChart({
  user,
}: {
  user?: User;
}): React.ReactElement {
  const chartConfig = {
    cumulativeValue: {
      label: "Split Total",
      color: "hsl(var(--stability))",
    },
  } satisfies ChartConfig;
  const splits = [
    {
      date: new Date("03/12/24"),
      value: 0,
    },
    {
      date: new Date("04/21/24"),
      item: "Torva Platebody",
      source: "Nex",
      value: 415200000,
      team: ["Barsk", "SoccerTheNub"],
    },
    {
      date: new Date("06/09/24"),
      item: "Voidwaker Blade",
      source: "Vet'ion",
      value: 39800000,
      team: ["Indy500", "Biapa"],
    },
    {
      date: new Date("12/13/24"),
      item: "Osmunten's Fang",
      source: "Tombs of Amascut",
      value: 14530000,
      team: ["HeavenlyFist", "TermiinusEST"],
    },
    {
      date: new Date("2/02/25"),
      item: "Dexterous Prayer Scroll",
      source: "Chambers of Xeric",
      value: 18329400,
      team: ["Funzip"],
    },
  ];
  const sortedSplits = [...splits].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  });

  let cumulative = 0;
  const cumulativeSplits = sortedSplits.map((split) => {
    cumulative += split.value;
    return {
      ...split,
      date: split.date.getTime(), // convert Date to timestamp (number)
      cumulativeValue: cumulative,
    };
  });

  // Get range of dates from the cumulativeSplits
  const dates = cumulativeSplits.map((d) => d.date);
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  const getMonthlyTicks = (start: Date, end: Date): number[] => {
    const ticks: number[] = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);

    while (current <= end) {
      ticks.push(current.getTime());
      current.setMonth(current.getMonth() + 1);
    }

    return ticks;
  };

  const monthlyTicks = getMonthlyTicks(minDate, maxDate);

  return (
    <section className="flex flex-col w-full">
      <h2 className="text-2xl font-bold mb-2">Splits</h2>
      <Card className="bg-card py-6 px-4 -ml-4">
        <CardContent className="p-0">
          <div className="flex text-xl mb-8 ml-4">
            <span>Total Split Value:</span>
            <span className="flex items-center gap-2 ml-4">
              <div className="relative size-6">
                <Image
                  src="/coins.png"
                  alt="coins"
                  className="absolute object-contain"
                  fill
                />
              </div>
              463m
            </span>
          </div>
          <ChartContainer config={chartConfig}>
            <LineChart accessibilityLayer data={cumulativeSplits}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                type="number"
                domain={["dataMin", "dataMax"]}
                ticks={monthlyTicks}
                tickFormatter={(timestamp: number) =>
                  formatter.format(new Date(timestamp))
                }
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                dataKey="cumulativeValue"
                tickMargin={8}
                tickFormatter={(value: number) => value / 1000000 + "m"}
              />
              <ChartTooltip
                cursor={false}
                defaultIndex={1}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name, item, index, payload: any) => (
                      <div className="flex flex-col">
                        <div className="flex gap-4">
                          <span>{payload.item}</span>
                          <div className="flex items-center ml-auto">
                            <div className="relative size-4 mr-1">
                              <Image
                                src="/coins.png"
                                alt="coins"
                                className="absolute object-contain"
                                fill
                              />
                            </div>
                            {Math.floor(payload.value / 10000) / 100}m
                          </div>
                        </div>
                        <div className="flex text-muted-foreground justify-between w-full gap-4">
                          <span>{payload.source}</span>
                          <span>
                            {new Intl.DateTimeFormat("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }).format(new Date(payload.date))}
                          </span>
                        </div>
                        {payload.teams && (
                          <div className="flex flex-col text-muted-foreground mt-4">
                            <span>Split with:</span>
                            <span>{payload.team.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    )}
                  />
                }
              />
              <Line
                dataKey="cumulativeValue"
                type="linear"
                stroke="var(--color-cumulativeValue)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-cumulativeValue)",
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </section>
  );
}
