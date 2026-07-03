import React, { useState } from 'react';
import { Card, Text, Box, Group, Button, UnstyledButton } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IntrusionAlert } from './dashboardTypes';

interface IntrusionAlertsChartProps {
  data?: IntrusionAlert[];
}

export default function IntrusionAlertsChart({ data = [] }: IntrusionAlertsChartProps) {
  const [filterType, setFilterType] = useState<'area' | 'time'>('area');
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
      <Group justify="space-between" mb="xl" wrap="wrap" gap="md">
        <Box>
          <Text fw={700} size="sm" c="dimmed" style={{ letterSpacing: '0.5px' }}>
            {t("intrusionTitle")}
          </Text>
          <Text size="xs" c="dimmed">
            {t("intrusionSubtitle")}
          </Text>
        </Box>

        <Group gap="xs">
          <Button
            size="xs"
            variant={filterType === 'area' ? 'filled' : 'default'}
            color="blue"
            radius="md"
            onClick={() => setFilterType('area')}
            styles={{
              root: {
                fontWeight: 600,
                fontSize: '11px',
                paddingLeft: '12px',
                paddingRight: '12px',
              },
            }}
          >
            {t("ktxButton")}
          </Button>
          <UnstyledButton
            onClick={() => setFilterType('time')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: filterType === 'time' ? '#e2e8f0' : 'transparent',
              color: '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            {t("dayMonthButton")}
          </UnstyledButton>
        </Group>
      </Group>

      <Box h={240}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="ktx"
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
              name={t("alertsCount")}
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
