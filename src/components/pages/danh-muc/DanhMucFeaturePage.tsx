"use client";

import {
  Badge,
  Card,
  Group,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconCategory } from "@tabler/icons-react";

type CotDanhMuc = {
  key: string;
  label: string;
};

type DanhMucFeaturePageProps = {
  title: string;
  description: string;
  endpoint: string;
  columns: CotDanhMuc[];
};

export default function DanhMucFeaturePage({
  title,
  description,
  endpoint,
  columns,
}: DanhMucFeaturePageProps) {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <Group>
          <div className="page-icon">
            <IconCategory size={20} />
          </div>
          <div>
            <Title order={3}>{title}</Title>
            <Text c="dimmed" size="sm">
              {description}
            </Text>
          </div>
        </Group>
        <Badge variant="light" color="blue">
          Chờ nối API
        </Badge>
      </Group>

      <Card withBorder radius="md" p="md">
        <Stack gap="xs">
          <Text size="sm" fw={600}>
            Endpoint dự kiến
          </Text>
          <Text size="sm" c="blue" className="endpoint-text">
            {endpoint}
          </Text>
        </Stack>
      </Card>

      <Card withBorder radius="md" p={0}>
        <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 70, textAlign: "center" }}>
                STT
              </Table.Th>
              {columns.map((column) => (
                <Table.Th key={column.key}>{column.label}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td
                colSpan={columns.length + 1}
                style={{ textAlign: "center", color: "#71717a" }}
              >
                Chưa có dữ liệu. Khu vực này dùng để hiển thị dữ liệu sau khi
                nối API.
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Card>

      <style
        dangerouslySetInnerHTML={{
          __html: `
.page-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1f5ca9;
  background: #eff6ff;
}

.endpoint-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  overflow-wrap: anywhere;
}
`,
        }}
      />
    </Stack>
  );
}
