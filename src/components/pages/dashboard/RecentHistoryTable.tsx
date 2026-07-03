import React from 'react';
import { Card, Group, Text, Table, Badge, Avatar, Anchor, ScrollArea } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { InOutHistory } from './dashboardTypes';

interface RecentHistoryTableProps {
  history?: InOutHistory[];
  onViewAll?: () => void;
}

export default function RecentHistoryTable({
  history = [],
  onViewAll,
}: RecentHistoryTableProps) {
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
      <Group justify="space-between" mb="md">
        <Text fw={700} size="sm" c="dimmed" style={{ letterSpacing: '0.5px' }}>
          {t("historyTitle")}
        </Text>
        <Anchor
          component="button"
          size="sm"
          fw={600}
          c="#1A73E8"
          onClick={onViewAll}
          style={{ textDecoration: 'none' }}
        >
          {t("viewAll")}
        </Anchor>
      </Group>

      <ScrollArea>
        <Table verticalSpacing="sm" highlightOnHover style={{ minWidth: 700 }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ color: '#475569', fontWeight: 600, fontSize: '12px' }}>{t("stt")}</Table.Th>
              <Table.Th style={{ color: '#475569', fontWeight: 600, fontSize: '12px' }}>{t("time")}</Table.Th>
              <Table.Th style={{ color: '#475569', fontWeight: 600, fontSize: '12px' }}>{t("studentId")}</Table.Th>
              <Table.Th style={{ color: '#475569', fontWeight: 600, fontSize: '12px' }}>{t("avatar")}</Table.Th>
              <Table.Th style={{ color: '#475569', fontWeight: 600, fontSize: '12px' }}>{t("name")}</Table.Th>
              <Table.Th style={{ color: '#475569', fontWeight: 600, fontSize: '12px', textAlign: 'center' }}>{t("type")}</Table.Th>
              <Table.Th style={{ color: '#475569', fontWeight: 600, fontSize: '12px' }}>{t("ktx")}</Table.Th>
              <Table.Th style={{ color: '#475569', fontWeight: 600, fontSize: '12px' }}>{t("room")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {history.map((row) => (
              <Table.Tr key={row.stt} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <Table.Td style={{ fontSize: '13px', color: '#64748b' }}>{row.stt}</Table.Td>
                <Table.Td style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>{row.time}</Table.Td>
                <Table.Td style={{ fontSize: '13px', color: '#64748b', fontFamily: 'monospace' }}>{row.studentId}</Table.Td>
                <Table.Td>
                  <Avatar src={row.avatarUrl} radius="xl" size="sm" alt={row.fullName} />
                </Table.Td>
                <Table.Td style={{ fontSize: '13px', color: '#1e293b', fw: 600 }}>{row.fullName}</Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  {row.type === 'Vào' ? (
                    <Badge
                      variant="light"
                      color="blue"
                      size="sm"
                      radius="md"
                      px="md"
                      py={10}
                      style={{
                        backgroundColor: '#E0F2FE',
                        color: '#0369A1',
                        fontWeight: 600,
                        fontSize: '11px',
                        border: 'none',
                      }}
                    >
                      {t("in")}
                    </Badge>
                  ) : (
                    <Badge
                      variant="light"
                      color="red"
                      size="sm"
                      radius="md"
                      px="md"
                      py={10}
                      style={{
                        backgroundColor: '#FEE2E2',
                        color: '#B91C1C',
                        fontWeight: 600,
                        fontSize: '11px',
                        border: 'none',
                      }}
                    >
                      {t("out")}
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td style={{ fontSize: '13px', color: '#475569' }}>{row.ktx}</Table.Td>
                <Table.Td style={{ fontSize: '13px', color: '#475569' }}>{row.room}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
