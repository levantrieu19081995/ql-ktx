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
import Reveal, { SoDem } from './Reveal';
import { INITIAL_QUICK_STATS, QuickStat } from './dashboardTypes';

interface QuickStatsCardsProps {
  stats?: QuickStat[];
  mocMo?: number;
}

export default function QuickStatsCards({ stats = INITIAL_QUICK_STATS, mocMo }: QuickStatsCardsProps) {
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
    <Stack gap="xs" style={{ fontFamily: 'var(--font-readex-pro), sans-serif' }}>
      <Text fw={800} size="sm" c="#1f5ca9" style={{ letterSpacing: '0.75px', textTransform: 'uppercase' }}>
        {t("quickStats")}
      </Text>
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 3, lg: 6 }} spacing="md">
        {stats.map((stat, index) => {
          const trans = getStatTranslation(stat.id);
          return (
            <Reveal key={stat.id} order={index + 1} mocMo={mocMo} cot={index % 3} style={{ height: '100%' }}>
            <Card
              withBorder
              radius="lg"
              p="md"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: '#e2e8f0',
                fontFamily: 'var(--font-readex-pro), sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(31, 92, 169, 0.12)';
                e.currentTarget.style.borderColor = '#00afef';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <Stack gap="xs" style={{ flexGrow: 1, justifyContent: 'space-between' }}>
                <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
                  <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                    <Text 
                      size="xs" 
                      fw={700} 
                      c="#1f5ca9" 
                      style={{ 
                        lineHeight: '1.3',
                        minHeight: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '11px',
                        letterSpacing: '0.2px'
                      }}
                    >
                      {trans.title}
                    </Text>
                    <Title 
                      order={3} 
                      fw={800} 
                      c="#1e293b" 
                      style={{ 
                        fontSize: '22px', 
                        fontFamily: 'var(--font-readex-pro), sans-serif',
                        letterSpacing: '-0.5px'
                      }}
                    >
                      <SoDem value={stat.value} />
                    </Title>
                  </Stack>
                  <Box
                    style={{
                      width: 40,
                      height: 40,
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
                <Text size="xs" c="dimmed" fw={500} style={{ lineHeight: '1.4' }}>
                  {stat.caption || trans.caption}
                </Text>
              </Stack>
            </Card>
            </Reveal>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
