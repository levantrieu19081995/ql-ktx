// src/app/[locale]/(app)/dashboard/PerformanceChart.client.tsx
"use client";

import { Card, Box, Title } from "@mantine/core";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function PerformanceChart({
  data,
}: {
  data: { name: string; value: number; fill?: string }[];
}) {
  return (
    <Card withBorder radius="lg" p="lg">
      <Title order={4} mb="md">
        Hiệu suất theo nền tảng
      </Title>
      <Box h={320} px="sm">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={35}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar dataKey="value" radius={[10, 10, 10, 10]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
