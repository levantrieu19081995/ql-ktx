import React from "react";
import { Card, Group, Text, Box } from "@mantine/core";
import { useTranslations } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useChartAnimation } from "./Reveal";
import { TimeChartData } from "./dashboardTypes";

interface TimeInOutChartProps {
  data?: TimeChartData[];
}

export default function TimeInOutChart({
  data = [],
}: TimeInOutChartProps) {
  const t = useTranslations("Dashboard");
  const anim = useChartAnimation();

  return (
    <Card
      withBorder
      radius="lg"
      p="lg"
      style={{
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      }}
    >
      <Group justify="space-between" mb="xl" wrap="wrap" gap="md">
        <Box>
          <Text
            fw={700}
            size="xs"
            c="#1f5ca9"
            style={{
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              fontFamily: "var(--font-readex-pro), sans-serif",
            }}
          >
            {t("timeChartTitle")}
          </Text>
        </Box>
      </Group>

      <Group justify="center" gap="lg" mb="md">
        <Group gap="xs">
          <Box
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#ef4444",
            }}
          />
          <Text size="xs" fw={600} c="slate.6">
            {t("out")}
          </Text>
        </Group>
        <Group gap="xs">
          <Box
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
            }}
          />
          <Text size="xs" fw={600} c="slate.6">
            {t("in")}
          </Text>
        </Group>
      </Group>

      <Box h={320}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={6}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="ra"
              name={t("out")}
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              maxBarSize={16}
              {...anim}
            />
            <Bar
              dataKey="vao"
              name={t("in")}
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={16}
              {...anim}
              animationBegin={anim.animationBegin + 350}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
