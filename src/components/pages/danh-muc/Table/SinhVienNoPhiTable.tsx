"use client";

import { Badge, Card, Table } from "@mantine/core";
import type { SinhVienNoPhi } from "@/types/type-danh-muc-ktx";

type SinhVienNoPhiTableProps = {
  items: SinhVienNoPhi[];
  page?: number;
  pageSize?: number;
};

const formatMoney = (value?: string | number | null) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "-";

  return `${numeric.toLocaleString("vi-VN")} đ`;
};

const getEventTypeName = (item: SinhVienNoPhi) =>
  item.loaiSuKien?.tenLoai ||
  item.tenLoaiSuKien ||
  item.noiDung ||
  item.ghiChu ||
  "-";

// const getEventTypeCode = (item: SinhVienNoPhi) =>
//   item.loaiSuKien?.maLoai || (item.loaiSuKienId ? String(item.loaiSuKienId) : "-");
// const getEventTypeCodeLabel = (item: SinhVienNoPhi) => {
//   const code =
//     item.loaiSuKien?.maLoai ||
//     (item.loaiSuKienId ? String(item.loaiSuKienId) : "");

//   const labels: Record<string, string> = {
//     NOT_CHECKED_OUT: "Chưa trả chỗ",
//     NO_DEBT: "Nợ học phí",
//   };

//   return labels[code] || code || "-";
// };

const getEventDescription = (item: SinhVienNoPhi) =>
  item.loaiSuKien?.moTa || item.noiDung || item.ghiChu || "-";

export default function SinhVienNoPhiTable({
  items,
  page = 1,
  pageSize = 10,
}: SinhVienNoPhiTableProps) {
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
            <Table.Th>Đợt tốt nghiệp</Table.Th>
            <Table.Th>Loại sự kiện</Table.Th>
            {/* <Table.Th>Mã loại</Table.Th> */}
            <Table.Th>Mô tả</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Số tiền nợ</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <Table.Tr key={item.sinhVienNoPhiId || item.sinhVienId || index}>
                <Table.Td style={{ textAlign: "center" }}>
                  {(page - 1) * pageSize + index + 1}
                </Table.Td>
                <Table.Td>
                  {item.maSinhVien || item.mssv || item.maso || "-"}
                </Table.Td>
                <Table.Td>{item.hoTen || item.hoten || "-"}</Table.Td>
                <Table.Td>
                  {item.lop || item.maLop || item.tenLop || "-"}
                </Table.Td>
                <Table.Td>{item.tenKhu || item.maKhu || "-"}</Table.Td>
                <Table.Td>
                  <Badge variant="light" color="teal" radius="sm">
                    {item.maPhong || item.tenPhong || "-"}
                  </Badge>
                </Table.Td>
                <Table.Td>{item.dotTotNghiep || "-"}</Table.Td>
                <Table.Td>{getEventTypeName(item)}</Table.Td>
                {/* <Table.Td>
                  <Badge variant="light" color="blue" radius="sm">
                    {getEventTypeCode(item)}
                  </Badge>
                </Table.Td> */}
                <Table.Td>{getEventDescription(item)}</Table.Td>
                <Table.Td style={{ textAlign: "right", fontWeight: 600 }}>
                  {formatMoney(item.soTien ?? item.soTienNo ?? item.tongTienNo)}
                </Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td
                colSpan={10}
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
