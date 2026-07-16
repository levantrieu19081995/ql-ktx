import React from 'react';
import { Card, Text, Box, Stack } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StudentActivity } from './dashboardTypes';

interface TopStudentsChartProps {
  data?: StudentActivity[];
}

function StudentTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string; payload?: StudentActivity };
}) {
  const item = payload?.payload;
  const label = item?.displayLabel
    ? item.displayLabel
    : item?.studentId
      ? `${item.name} - ${item.studentId}`
      : item?.name || payload?.value || '';

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-260} y={5} textAnchor="start" fill="#1f2937" fontSize={11} fontWeight={600}>
        {label}
      </text>
    </g>
  );
}

export default function TopStudentsChart({ data = [] }: TopStudentsChartProps) {
  const t = useTranslations("Dashboard");

  return (
    <Card
      withBorder
      radius="lg"
      p="lg"
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Stack gap={4} mb="xl">
        <Text fw={700} size="xs" c="#1f5ca9" style={{ letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-readex-pro), sans-serif' }}>
          {t("top10Title")}
        </Text>
        <Text size="xs" c="dimmed">
          {t("top10Subtitle")}
        </Text>
      </Stack>

      <Box h={350}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 20, left: 24, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="displayLabel"
              axisLine={false}
              tickLine={false}
              tick={<StudentTick />}
              interval={0}
              width={270}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              formatter={(value: number) => [value, t("scansCount")]}
              labelFormatter={(_, payload) => {
                const item = payload?.[0]?.payload as StudentActivity | undefined;
                if (!item) return '';
                return item.studentId ? `${item.name} - ${item.studentId}` : item.name;
              }}
              contentStyle={{
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                fontSize: '12px',
              }}
            />
            <Bar
              dataKey="count"
              name={t("scansCount")}
              fill="#1d4ed8"
              radius={[0, 6, 6, 0]}
              barSize={18}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
