// "use client";

// import { Card, Group, Stack, Table, Text, Title } from "@mantine/core";
// import { IconCategory } from "@tabler/icons-react";
// import { ReactNode } from "react";

// type CotDanhMuc = {
//   key: string;
//   label: string;
// };

// type DanhMucFeaturePageProps = {
//   title: string;
//   description: string;
//   columns: CotDanhMuc[];
//   items: Record<string, any>[];
//   searchControls?: ReactNode;
// };

// export default function DanhMucFeaturePage({
//   title,
//   description,
//   columns,
//   items,
//   searchControls,
// }: DanhMucFeaturePageProps) {
//   return (
//     <Stack gap="lg">
//       {/* Tiêu đề trang */}
//       <Group justify="space-between" align="flex-end">
//         <Group>
//           <div className="page-icon">
//             <IconCategory size={20} />
//           </div>

//           <div>
//             <Title order={3}>{title}</Title>
//             <Text c="dimmed" size="sm">
//               {description}
//             </Text>
//           </div>
//         </Group>
//       </Group>

//       {/* Tìm kiếm */}
//       {searchControls && (
//         <Card withBorder radius="md" p="md">
//           <Group align="end">{searchControls}</Group>
//         </Card>
//       )}

//       <Card withBorder radius="md" p={0}>
//         <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
//           <Table.Thead>
//             <Table.Tr>
//               <Table.Th style={{ width: 70, textAlign: "center" }}>
//                 STT
//               </Table.Th>

//               {columns.map((column) => (
//                 <Table.Th key={column.key}>{column.label}</Table.Th>
//               ))}
//             </Table.Tr>
//           </Table.Thead>

//           <Table.Tbody>
//             {items.length > 0 ? (
//               items.map((item, index) => (
//                 <Table.Tr key={item.guid || item.id || index}>
//                   <Table.Td style={{ textAlign: "center" }}>
//                     {index + 1}
//                   </Table.Td>

//                   {columns.map((column) => (
//                     <Table.Td key={column.key}>
//                       {item[column.key] ?? "-"}
//                     </Table.Td>
//                   ))}
//                 </Table.Tr>
//               ))
//             ) : (
//               <Table.Tr>
//                 <Table.Td
//                   colSpan={columns.length + 1}
//                   style={{ textAlign: "center", color: "#71717a" }}
//                 >
//                   Chưa có dữ liệu.
//                 </Table.Td>
//               </Table.Tr>
//             )}
//           </Table.Tbody>
//         </Table>
//       </Card>

//       <style
//         dangerouslySetInnerHTML={{
//           __html: `
// .page-icon {
//   width: 40px;
//   height: 40px;
//   border-radius: 8px;
//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
//   color: #1f5ca9;
//   background: #eff6ff;
// }
// `,
//         }}
//       />
//     </Stack>
//   );
// }
"use client";

import { Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconCategory } from "@tabler/icons-react";
import { ReactNode } from "react";
import KhuKtxTable from "./Table/KhuKtxTable";

type DanhMucType = "khu" | "phong";

type DanhMucFeaturePageProps = {
  type: DanhMucType;
  title: string;
  description: string;
  items: Record<string, any>[];
  searchControls?: ReactNode;
  pagination?: ReactNode;
};

export default function DanhMucFeaturePage({
  type,
  title,
  description,
  items,
  searchControls,
  pagination,
}: DanhMucFeaturePageProps) {
  const renderTable = () => {
    switch (type) {
      case "khu":
        return <KhuKtxTable items={items} />;

      default:
        return null;
    }
  };

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
      </Group>

      {searchControls && (
        <Card withBorder radius="md" p="md">
          <Group align="end">{searchControls}</Group>
        </Card>
      )}

      {renderTable()}
      {pagination}
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
`,
        }}
      />
    </Stack>
  );
}
