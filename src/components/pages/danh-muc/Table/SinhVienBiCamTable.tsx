// "use client";

// import { Card, Table } from "@mantine/core";

// type Props = {
//   items: any[];
// };

// const formatDate = (value?: number | null) => {
//   if (!value) return "-";

//   return new Date(value).toLocaleDateString("vi-VN");
// };

// export default function SinhVienBiCamTable({ items }: Props) {
//   return (
//     <Card withBorder radius="md" p={0}>
//       <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
//         <Table.Thead>
//           <Table.Tr>
//             <Table.Th style={{ width: 70, textAlign: "center" }}>STT</Table.Th>
//             <Table.Th>Mã sinh viên</Table.Th>
//             <Table.Th>Lý do cấm</Table.Th>
//             <Table.Th>Ngày bắt đầu</Table.Th>
//             <Table.Th>Ngày kết thúc</Table.Th>
//           </Table.Tr>
//         </Table.Thead>

//         <Table.Tbody>
//           {items.length > 0 ? (
//             items.map((item, index) => (
//               <Table.Tr key={item.camId || index}>
//                 <Table.Td style={{ textAlign: "center" }}>{index + 1}</Table.Td>
//                 <Table.Td>{item.maSinhVien ?? "-"}</Table.Td>
//                 <Table.Td>{item.lyDo ?? "-"}</Table.Td>
//                 <Table.Td>{formatDate(item.ngayBatDau)}</Table.Td>
//                 <Table.Td>{formatDate(item.ngayKetThuc)}</Table.Td>
//               </Table.Tr>
//             ))
//           ) : (
//             <Table.Tr>
//               <Table.Td
//                 colSpan={5}
//                 style={{ textAlign: "center", color: "#71717a" }}
//               >
//                 Chưa có dữ liệu.
//               </Table.Td>
//             </Table.Tr>
//           )}
//         </Table.Tbody>
//       </Table>
//     </Card>
//   );
// }
"use client";

import { ActionIcon, Card, Group, Table, Tooltip } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";

type Props = {
  items: any[];
  onEdit?: (item: any) => void;
  page?: number;
  pageSize?: number;
};

const formatDate = (value?: number | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN");
};

export default function SinhVienBiCamTable({
  items,
  onEdit,
  page = 1,
  pageSize = 10,
}: Props) {
  return (
    <Card withBorder radius="md" p={0}>
      <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 70, textAlign: "center" }}>STT</Table.Th>
            <Table.Th>Mã sinh viên</Table.Th>
            <Table.Th>Lý do cấm</Table.Th>
            <Table.Th>Ngày bắt đầu</Table.Th>
            <Table.Th>Ngày kết thúc</Table.Th>
            <Table.Th style={{ width: 90, textAlign: "center" }}>#</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <Table.Tr key={item.camId || index}>
                <Table.Td style={{ textAlign: "center" }}>
                  {(page - 1) * pageSize + index + 1}
                </Table.Td>
                <Table.Td>{item.maSinhVien ?? "-"}</Table.Td>
                <Table.Td>{item.lyDo ?? "-"}</Table.Td>
                <Table.Td>{formatDate(item.ngayBatDau)}</Table.Td>
                <Table.Td>{formatDate(item.ngayKetThuc)}</Table.Td>
                <Table.Td>
                  <Group justify="center">
                    <Tooltip label="Sửa">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => onEdit?.(item)}
                      >
                        <IconPencil size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td
                colSpan={6}
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
