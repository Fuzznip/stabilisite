"use client"

import { User } from "@/lib/types"
import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  clanPoints: {
    label: "Clan Points",
  },
  diary: {
    label: "Diary",
    color: "hsl(var(--chart-1))",
  },
  event: {
    label: "Event",
    color: "hsl(var(--chart-2))",
  },
  time: {
    label: "Time",
    color: "hsl(var(--chart-3))",
  },
  splits: {
    label: "Splits",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export default function RankPointPieChart({ user }: { user: User | undefined }) {
  const pieChartData = [
    { name: "diary", value: Math.trunc(Number(user?.diaryPoints)) || 0, fill: "#003f5c" },
    { name: "event", value: Math.trunc(Number(user?.eventPoints)) || 0, fill: "#58508d" },
    { name: "time", value: Math.trunc(Number(user?.timePoints)) || 0, fill: "#bc5090" },
    { name: "splits", value: Math.trunc(Number(user?.splitPoints)) || 0, fill: "#ff6361" },
  ];
  
  const totalClanPoints = pieChartData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <Card className="flex flex-col border-none">
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] min-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={pieChartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalClanPoints.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Clan Points
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
