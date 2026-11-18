import React from "react";
import { useChartAnimation } from './Reveal';
import { Card, Text, Box, Group, Button } from "@mantine/core";
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
import { IntrusionAlert } from "./dashboardTypes";

interface IntrusionAlertsChartProps {
  data?: IntrusionAlert[];
  filterType: "area" | "time";
  setFilterType: (type: "area" | "time") => void;
}

export default function IntrusionAlertsChart({
  data = [],
  filterType,
  setFilterType,
}: IntrusionAlertsChartProps) {
  const anim = useChartAnimation(250);
  const t = useTranslations("Dashboard");

  return (
    <Card
      withBorder
      radius="lg"
      p="lg"
      style={{
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
        height: "100%",
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
            {t("intrusionTitle")}
          </Text>
          <Text size="xs" c="dimmed">
            {t("intrusionSubtitle")}
          </Text>
        </Box>

        <Group gap="xs" align="center">
          <Button
            size="xs"
            variant={filterType === "area" ? "filled" : "default"}
            color="blue"
            radius="md"
            onClick={() => setFilterType("area")}
            styles={{
              root: {
                fontWeight: 600,
                fontSize: "11px",
                paddingLeft: "12px",
                paddingRight: "12px",
                height: "30px",
              },
            }}
          >
            {t("ktxButton")}
          </Button>

          <Button
            size="xs"
            variant={filterType === "time" ? "filled" : "default"}
            color="blue"
            radius="md"
            onClick={() => setFilterType("time")}
            styles={{
              root: {
                fontWeight: 600,
                fontSize: "11px",
                paddingLeft: "12px",
                paddingRight: "12px",
                height: "30px",
              },
            }}
          >
            {t("dayMonthButton")}
          </Button>
        </Group>
      </Group>

      {data.length === 0 ? (
        <Box
          h={240}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Text
            c="dimmed"
            size="sm"
            fw={500}
            style={{ fontFamily: "var(--font-readex-pro), sans-serif" }}
          >
            Hiện tại chưa có dữ liệu.
          </Text>
        </Box>
      ) : (
        <Box h={240}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="label"
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
                dataKey="count"
                name={t("alertsCount")}
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
                {...anim}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Card>
  );
}
