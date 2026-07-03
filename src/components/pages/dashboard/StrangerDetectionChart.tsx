import React from 'react';
import { Card, Text, Box } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StrangerDetection } from './dashboardTypes';

interface StrangerDetectionChartProps {
  data?: StrangerDetection[];
}

export default function StrangerDetectionChart({ data = [] }: StrangerDetectionChartProps) {
  const t = useTranslations("Dashboard");

  return (
    <Card
      withBorder
      radius="lg"
      p="lg"
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        height: '100%',
      }}
    >
      <Box mb="xl">
        <Text fw={700} size="sm" c="dimmed" style={{ letterSpacing: '0.5px' }}>
          {t("strangerChartTitle")}
        </Text>
        <Text size="xs" c="dimmed">
          {t("strangerChartSubtitle")}
        </Text>
      </Box>

      <Box h={240}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              name={t("strangerCount")}
              stroke="#2563eb"
              strokeWidth={3.5}
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
