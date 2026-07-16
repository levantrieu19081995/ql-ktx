"use client";

import { Card, Table } from "@mantine/core";
import type { PhongKtx } from "@/types/type-danh-muc-ktx";

type PhongKtxTableProps = {
  items: PhongKtx[];
};

export default function PhongKtxTable({ items }: PhongKtxTableProps) {
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
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <Table.Tr key={item.phongId || item.guid || index}>
                <Table.Td style={{ textAlign: "center" }}>{index + 1}</Table.Td>
                <Table.Td>{item.phongMa || item.maPhong || "-"}</Table.Td>
                <Table.Td>{item.tenKhu || item.maKhu || "-"}</Table.Td>
                <Table.Td>{item.sucChua ?? "-"}</Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td
                colSpan={4}
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
