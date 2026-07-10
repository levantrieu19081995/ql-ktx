"use client";

import { Card, Table } from "@mantine/core";

type KhuKtxTableProps = {
  items: any[];
};

export default function KhuKtxTable({ items }: KhuKtxTableProps) {
  return (
    <Card withBorder radius="md" p={0}>
      <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 70, textAlign: "center" }}>STT</Table.Th>
            <Table.Th>Mã khu</Table.Th>
            <Table.Th>Tên khu</Table.Th>
            <Table.Th>Số lượng phòng</Table.Th>
            <Table.Th>Mô tả</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <Table.Tr key={item.guid || item.khuId || index}>
                <Table.Td style={{ textAlign: "center" }}>{index + 1}</Table.Td>
                <Table.Td>{item.khuMa || item.maKhu || "-"}</Table.Td>
                <Table.Td>{item.khuTen || item.tenKhu || "-"}</Table.Td>
                <Table.Td>{item.soLuongPhong ?? "-"}</Table.Td>
                <Table.Td>{item.moTa ?? "-"}</Table.Td>
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
