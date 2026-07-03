import React, { useState } from 'react';
import { Card, Group, Text, Box, Button, UnstyledButton, Popover } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeChartData } from './dashboardTypes';
import dayjs from 'dayjs';

interface TimeInOutChartProps {
  data?: TimeChartData[];
  date?: Date | null;
  onDateChange?: (d: Date | null) => void;
  timeUnit?: 'day' | 'month' | 'year';
  onTimeUnitChange?: (unit: 'day' | 'month' | 'year') => void;
}

export default function TimeInOutChart({
  data = [],
  date,
  onDateChange,
  timeUnit: propTimeUnit,
  onTimeUnitChange,
}: TimeInOutChartProps) {
  const [localTimeUnit, setLocalTimeUnit] = useState<'day' | 'month' | 'year'>('day');
  const [localDate, setLocalDate] = useState<Date | null>(new Date('2026-01-06'));
  const [opened, setOpened] = useState(false);
  const t = useTranslations("Dashboard");

  const activeTimeUnit = propTimeUnit !== undefined ? propTimeUnit : localTimeUnit;
  const handleTimeUnitChange = (unit: 'day' | 'month' | 'year') => {
    if (onTimeUnitChange) onTimeUnitChange(unit);
    else setLocalTimeUnit(unit);
  };

  const activeDate = date !== undefined ? date : localDate;
  const handleDateChange = (d: Date | null) => {
    if (onDateChange) onDateChange(d);
    else setLocalDate(d);
  };

  const formattedDate = activeDate ? dayjs(activeDate).format("DD/MM/YYYY") : "__/__/____";

  return (
    <Card
      withBorder
      radius="lg"
      p="lg"
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Group justify="space-between" mb="xl" wrap="wrap" gap="md">
        <Box>
          <Text fw={700} size="sm" c="dimmed" style={{ letterSpacing: '0.5px' }}>
            {t("timeChartTitle")}
          </Text>
        </Box>

        <Group gap="xs">
          {/* Day/Month/Year Toggle */}
          <Box
            style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              padding: '4px',
              display: 'flex',
              gap: '4px',
            }}
          >
            {(['day', 'month', 'year'] as const).map((unit) => {
              const label = unit === 'day' ? t("day") : unit === 'month' ? t("month") : t("year");
              const active = activeTimeUnit === unit;
              return (
                <UnstyledButton
                  key={unit}
                  onClick={() => handleTimeUnitChange(unit)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: active ? '#3b82f6' : 'transparent',
                    color: active ? '#ffffff' : '#64748b',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </UnstyledButton>
              );
            })}
          </Box>

          {/* Popover Date Picker */}
          <Popover
            opened={opened}
            onChange={setOpened}
            position="bottom-end"
            shadow="md"
            trapFocus={false}
            closeOnClickOutside
            withinPortal
          >
            <Popover.Target>
              <Button
                variant="default"
                radius="md"
                leftSection={<IconCalendar size={16} color="#64748b" />}
                onClick={() => setOpened((o) => !o)}
                styles={{
                  root: {
                    borderColor: '#e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#1e293b',
                    fontWeight: 500,
                    fontSize: '13px',
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    height: '36px',
                  },
                }}
              >
                {formattedDate}
              </Button>
            </Popover.Target>
            <Popover.Dropdown p="xs">
              <DatePicker
                value={activeDate}
                locale="vi"
                previousIcon={<IconChevronLeft size={16} />}
                nextIcon={<IconChevronRight size={16} />}
                onChange={(d: any) => {
                  handleDateChange(d);
                  setOpened(false);
                }}
              />
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Group>

      {/* Chart Legend */}
      <Group justify="center" gap="lg" mb="md">
        <Group gap="xs">
          <Box style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <Text size="xs" fw={600} c="slate.6">{t("out")}</Text>
        </Group>
        <Group gap="xs">
          <Box style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
          <Text size="xs" fw={600} c="slate.6">{t("in")}</Text>
        </Group>
      </Group>

      <Box h={320}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
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
              dataKey="ra"
              name={t("out")}
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              maxBarSize={16}
            />
            <Bar
              dataKey="vao"
              name={t("in")}
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
