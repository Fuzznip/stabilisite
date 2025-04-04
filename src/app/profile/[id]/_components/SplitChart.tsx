"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
import { Split, User } from "@/lib/types";
import { useMemo } from "react";

const chartConfig = {
  cumulativeValue: {
    label: "Split Total",
    color: "hsl(var(--stability))",
  },
} satisfies ChartConfig;

export default function SplitChart({
  user,
  splits,
}: {
  user: User | null;
  splits: Split[];
}): React.ReactElement {
  const chartData = useMemo(() => getChartData(user, splits), [user, splits]);

  const axisFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  });
  const tooltipFormatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const minDate = chartData[0].date;
  const maxDate = chartData.slice(-1)[0].date;

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
      <Card className="bg-card pl-0 p-4 text-5xl text-muted-foreground flex items-center justify-center h-fit">
        <CardContent className="p-0 w-full">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="flex flex-col mb-6 ml-4">
              <span className="text-base text-muted-foreground mb-1">
                Total Split Value
              </span>
              <span
                className={cn(
                  "flex items-center gap-2 text-4xl",
                  true && "text-[#23FE9A]"
                )}
              >
                <div className="relative size-8">
                  <Image
                    src="/coins.png"
                    alt="coins"
                    className="absolute object-contain"
                    sizes="100%"
                    fill
                  />
                </div>
                {Math.floor(chartData.slice(-2)[0].cumulativeValue / 1000000)}m
              </span>
            </div>
            <div className="flex flex-col mb-6 ml-4">
              <span className="text-base text-muted-foreground mb-1">
                Most recent split
              </span>
              <div
                className={cn(
                  "flex items-center gap-2 text-xl",
                  true && "text-[#23FE9A]"
                )}
              >
                <span className="text-foreground mr-2">
                  {chartData.slice(-2)[0].itemName}
                </span>
                <div className="relative size-6">
                  <Image
                    src="/coins.png"
                    alt="coins"
                    className="absolute object-contain"
                    sizes="100%"
                    fill
                  />
                </div>
                {Math.floor(chartData.slice(-2)[0].itemPrice / 1000000)}m
              </div>
              <span className="text-muted-foreground text-sm">
                {tooltipFormatter.format(chartData.slice(-2)[0].date)}
              </span>
            </div>
          </div>
          <ChartContainer config={chartConfig} className="max-h-80 w-full">
            <LineChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={["dataMin", "dataMax"]}
                ticks={monthlyTicks}
                tickFormatter={(timestamp: number) =>
                  axisFormatter.format(new Date(timestamp))
                }
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                interval={1}
              />
              <YAxis
                dataKey="cumulativeValue"
                tickMargin={8}
                tickFormatter={(value: number) => value / 1000000 + "m"}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value, name, item, index, split: any) => {
                      if (split.id === "join")
                        return (
                          <div className="flex flex-col text-base">
                            <span className="text-foreground">
                              You joined Stability!
                            </span>
                            <span>{tooltipFormatter.format(split.date)}</span>
                          </div>
                        );
                      if (split.id === "today")
                        return (
                          <div className="flex flex-col text-base">
                            <span className="text-foreground">Today</span>
                            <span>{tooltipFormatter.format(split.date)}</span>
                          </div>
                        );
                      return (
                        <div className="flex flex-col">
                          <div className="flex gap-4 text-base">
                            <span className="text-foreground">
                              {split.itemName}
                            </span>
                            <div
                              className={cn(
                                "flex items-center ml-auto",
                                split.itemPrice >= 10000000 && "text-[#23FE9A]"
                              )}
                            >
                              <div className="relative size-4 mr-1">
                                <Image
                                  src="/coins.png"
                                  alt="coins"
                                  className="absolute object-contain"
                                  sizes="100%"
                                  fill
                                />
                              </div>
                              {Math.floor(split.itemPrice / 10000) / 100}m
                            </div>
                          </div>
                          <div className="flex text-muted-foreground justify-between w-full gap-4">
                            <span>
                              {tooltipFormatter.format(
                                new Date(split.date || "")
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    }}
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

function getChartData(
  user: User | null,
  splits: Split[]
): (Split & { timestamp: number; cumulativeValue: number })[] {
  const sortedSplits = [...splits].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  sortedSplits.unshift({
    id: "join",
    userId: user?.discordId || "",
    itemName: "",
    splitContribution: 0,
    groupSize: 0,
    date: user?.joinDate || new Date(""),
    itemPrice: 0,
  });

  const now = new Date();
  const lastDate = new Date(sortedSplits.slice(-1)[0].date);
  lastDate.setMonth(lastDate.getMonth() + 1);
  sortedSplits.push({
    id: "today",
    userId: user?.discordId || "",
    itemName: "",
    splitContribution: 0,
    groupSize: 0,
    date: now,
    itemPrice: 0,
  });

  let cumulative = 0;
  const cumulativeSplits = sortedSplits.map((split) => {
    cumulative += split.itemPrice;
    return {
      ...split,
      timestamp: split.date.getTime(),
      cumulativeValue: cumulative,
    };
  });

  return cumulativeSplits;
}
