import React from 'react';
import { Card, Text, Box, Stack } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StudentActivity } from './dashboardTypes';

interface TopStudentsChartProps {
  data?: StudentActivity[];
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
        <Text fw={700} size="sm" c="dimmed" style={{ letterSpacing: '0.5px' }}>
          {t("top5Title")}
        </Text>
        <Text size="xs" c="dimmed">
          {t("top5Subtitle")}
        </Text>
      </Stack>

      <Box h={260}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 20, left: 30, bottom: 0 }}
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
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
              width={100}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
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
