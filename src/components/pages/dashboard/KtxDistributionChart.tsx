import React from 'react';
import { Card, Text, Box, Group, Stack, Anchor, Flex } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { KtxDistribution } from './dashboardTypes';

interface KtxDistributionChartProps {
  data?: KtxDistribution[];
  onViewDetails?: () => void;
}

export default function KtxDistributionChart({
  data = [],
  onViewDetails,
}: KtxDistributionChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const t = useTranslations("Dashboard");

  return (
    <Card
      withBorder
      radius="lg"
      p="lg"
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box mb="md">
        <Text fw={700} size="sm" c="dimmed" style={{ letterSpacing: '0.5px' }}>
          {t("distributionTitle")}
        </Text>
      </Box>

      <Flex align="center" justify="space-between" style={{ flex: 1 }} wrap="wrap" gap="md">
        {/* Pie Chart container */}
        <Box style={{ position: 'relative', width: 180, height: 180, margin: '0 auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data as any}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text overlay */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <Text size="xs" fw={700} c="dimmed">
              {t("totalLabel")}
            </Text>
            <Text size="sm" fw={800} c="slate.9">
              {total} SV
            </Text>
          </div>
        </Box>

        {/* Legend */}
        <Stack gap="xs" style={{ flex: 1, minWidth: '160px' }}>
          {data.map((item) => (
            <Group key={item.name} justify="space-between" wrap="nowrap">
              <Group gap="xs" wrap="nowrap">
                <Box style={{ width: 12, height: 12, borderRadius: '3px', backgroundColor: item.color, flexShrink: 0 }} />
                <Text size="xs" fw={700} c="slate.8">
                  {item.name}
                </Text>
              </Group>
              <Text size="xs" fw={800} c="slate.9">
                {item.value} ({item.percentage}%)
              </Text>
            </Group>
          ))}
        </Stack>
      </Flex>

      <Group justify="space-between" mt="auto" pt="sm">
        <Text size="xs" c="dimmed">
          {t("totalStudentsText", { count: total })}
        </Text>
        <Anchor
          component="button"
          size="sm"
          fw={600}
          c="#1A73E8"
          onClick={onViewDetails}
          style={{ textDecoration: 'none' }}
        >
          {t("viewDetails")}
        </Anchor>
      </Group>
    </Card>
  );
}
