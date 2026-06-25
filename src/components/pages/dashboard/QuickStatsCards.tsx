import React from 'react';
import { SimpleGrid, Card, Group, Stack, Text, Title, Box } from '@mantine/core';
import { useTranslations } from 'next-intl';
import {
  IconUsers,
  IconUserCheck,
  IconUserMinus,
  IconCurrencyDong,
  IconBan,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { QUICK_STATS, QuickStat } from './mockDashboardData';

interface QuickStatsCardsProps {
  stats?: QuickStat[];
}

export default function QuickStatsCards({ stats = QUICK_STATS }: QuickStatsCardsProps) {
  const t = useTranslations("Dashboard");

  const getIcon = (type: string, color: string) => {
    switch (type) {
      case 'total':
        return <IconUsers size={22} color={color} />;
      case 'present':
        return <IconUserCheck size={22} color={color} />;
      case 'out':
        return <IconUserMinus size={22} color={color} />;
      case 'debt':
        return <IconCurrencyDong size={24} color={color} />;
      case 'banned':
        return <IconBan size={22} color={color} />;
      case 'stranger':
        return <IconAlertTriangle size={22} color={color} />;
      default:
        return <IconUsers size={22} color={color} />;
    }
  };

  const getStatTranslation = (id: string) => {
    switch (id) {
      case 'total_sv':
        return { title: t("totalTitle"), caption: t("totalCaption") };
      case 'present':
        return { title: t("presentTitle"), caption: t("presentCaption", { percent: '67,0' }) };
      case 'out':
        return { title: t("outTitle"), caption: t("outCaption", { percent: '33,0' }) };
      case 'debt':
        return { title: t("debtTitle"), caption: t("debtCaption", { percent: '1,8' }) };
      case 'banned':
        return { title: t("bannedTitle"), caption: t("bannedCaption", { percent: '2,1' }) };
      case 'stranger':
        return { title: t("strangerTitle"), caption: t("strangerCaption") };
      default:
        return { title: '', caption: '' };
    }
  };

  return (
    <Stack gap="xs">
      <Text fw={700} size="sm" c="dimmed" style={{ letterSpacing: '0.5px' }}>
        {t("quickStats")}
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 6 }} spacing="md">
        {stats.map((stat) => {
          const trans = getStatTranslation(stat.id);
          return (
            <Card
              key={stat.id}
              withBorder
              radius="lg"
              p="md"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
              }}
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
                <Stack gap={4} style={{ flex: 1 }}>
                  <Text size="xs" fw={700} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                    {trans.title}
                  </Text>
                  <Title order={3} fw={800} c="#1e293b" style={{ fontSize: '20px' }}>
                    {stat.value}
                  </Title>
                </Stack>
                <Box
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: stat.gradient,
                    flexShrink: 0,
                  }}
                >
                  {getIcon(stat.iconType, stat.iconColor)}
                </Box>
              </Group>
              <Text size="xs" c="dimmed" mt="xs" fw={500}>
                {trans.caption}
              </Text>
            </Card>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
