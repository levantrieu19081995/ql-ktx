"use client";

import { Card, Table, Text } from "@mantine/core";
import type { PhongKtx } from "@/types/type-danh-muc-ktx";

type PhongKtxTableProps = {
  items: PhongKtx[];
  onSelectRoom?: (item: PhongKtx) => void;
  page?: number;
  pageSize?: number;
};

export default function PhongKtxTable({
  items,
  onSelectRoom,
  page = 1,
  pageSize = 10,
}: PhongKtxTableProps) {
  return (
    <Card withBorder radius="md" p={0}>
      <Table
        highlightOnHover
        verticalSpacing="sm"
        horizontalSpacing="md"
        style={{ tableLayout: "fixed", width: "100%" }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 70, textAlign: "center" }}>STT</Table.Th>
            <Table.Th style={{ width: 180 }}>Mã phòng</Table.Th>
            <Table.Th style={{ width: 180 }}>Khu</Table.Th>
            <Table.Th style={{ width: 140 }}>Sức chứa</Table.Th>
            <Table.Th style={{ width: 160 }}>Số chỗ đang có</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <Table.Tr
                key={item.phongId || item.guid || index}
                onClick={() => onSelectRoom?.(item)}
                style={{
                  cursor: onSelectRoom ? "pointer" : "default",
                }}
              >
                <Table.Td style={{ textAlign: "center" }}>
                  {(page - 1) * pageSize + index + 1}
                </Table.Td>
                <Table.Td>
                  <Text fw={600} c={onSelectRoom ? "blue.7" : undefined}>
                    {item.phongMa || item.maPhong || "-"}
                  </Text>
                </Table.Td>
                <Table.Td>{item.tenKhu || item.maKhu || "-"}</Table.Td>
                <Table.Td>{item.sucChua ?? "-"}</Table.Td>
                <Table.Td>{item.soChoDangCo ?? "-"}</Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td
                colSpan={5}
                style={{ textAlign: "center", color: "#71717a" }}
              >
                Chưa có dữ liệu.
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Card>
  );
}
