"use client";

import { Card, Table } from "@mantine/core";

type SinhVienKtxTableProps = {
  items: any[];
  page?: number;
  pageSize?: number;
};

export default function SinhVienKtxTable({
  items,
  page = 1,
  pageSize = 10,
}: SinhVienKtxTableProps) {
  return (
    <Card withBorder radius="md" p={0}>
      <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 70, textAlign: "center" }}>STT</Table.Th>
            <Table.Th>Mã sinh viên</Table.Th>
            <Table.Th>Họ tên</Table.Th>
            <Table.Th>Lớp</Table.Th>
            <Table.Th>Khu</Table.Th>
            <Table.Th>Phòng</Table.Th>
            <Table.Th>Phòng cũ</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <Table.Tr key={item.sinhVienId || index}>
                <Table.Td style={{ textAlign: "center" }}>
                  {(page - 1) * pageSize + index + 1}
                </Table.Td>
                <Table.Td>{item.maSinhVien ?? "-"}</Table.Td>
                <Table.Td>{item.hoTen ?? "-"}</Table.Td>
                <Table.Td>{item.lop ?? "-"}</Table.Td>
                <Table.Td>{item.khuTen || item.tenKhu || item.khuMa || item.maKhu || "-"}</Table.Td>
                <Table.Td>{item.maPhong ?? "-"}</Table.Td>
                <Table.Td>{item.maPhongCu ?? "-"}</Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td
                colSpan={7}
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
