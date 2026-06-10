/* eslint-disable @typescript-eslint/no-unused-expressions */
// "use client";

// import React, { useState } from "react";
// import {
//   Modal,
//   Stack,
//   Checkbox,
//   Group,
//   Button,
//   Title,
//   Text,
//   ScrollArea,
//   Box,
//   ActionIcon,
// } from "@mantine/core";
// import {
//   IconBuildingCommunity,
//   IconBuilding,
//   IconFolder,
// } from "@tabler/icons-react";

// interface OrgNode {
//   id: number;
//   name: string;
//   children?: OrgNode[];
// }

// interface UpdateOrganizationModalProps {
//   opened: boolean;
//   onClose: () => void;
//   onSave: (selectedOrgs: OrgNode[]) => void;
//   organizationTree: OrgNode[];
//   selectedIds?: number[];
// }

// export default function UpdateOrganizationModal({
//   opened,
//   onClose,
//   onSave,
//   organizationTree,
//   selectedIds = [],
// }: UpdateOrganizationModalProps) {
//   const [selected, setSelected] = useState<number[]>(selectedIds);
//   const [expanded, setExpanded] = useState<Set<number>>(new Set());

//   const toggleSelection = (id: number) => {
//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   const toggleExpand = (id: number) => {
//     setExpanded((prev) => {
//       const newSet = new Set(prev);
//       newSet.has(id) ? newSet.delete(id) : newSet.add(id);
//       return newSet;
//     });
//   };

//   const renderTree = (nodes: OrgNode[], level = 0, isLast = false) => (
//     <Stack gap={0} ml={level > 0 ? 16 : 0} style={{ position: "relative" }}>
//       {nodes.map((node, index) => {
//         const isSelected = selected.includes(node.id);
//         const hasChildren = node.children && node.children.length > 0;
//         const isLastChild = index === nodes.length - 1;
//         const isExpanded = expanded.has(node.id);

//         return (
//           <Box
//             key={node.id}
//             style={{
//               position: "relative",
//               paddingLeft: level > 0 ? 16 : 0,
//             }}
//           >
//             {/* Đường thẳng dọc giữa cha và con */}
//             {level > 0 && (
//               <div
//                 style={{
//                   position: "absolute",
//                   top: 0,
//                   left: 6,
//                   bottom: isLastChild ? "1em" : 0,
//                   width: 1,
//                   backgroundColor: "rgba(0,0,0,0.15)",
//                 }}
//               />
//             )}

//             {/* Nhánh ngang */}
//             {level > 0 && (
//               <div
//                 style={{
//                   position: "absolute",
//                   top: "0.9em",
//                   left: 6,
//                   width: 12,
//                   height: 1,
//                   backgroundColor: "rgba(0,0,0,0.15)",
//                 }}
//               />
//             )}

//             <Group gap={4} py={4} style={{}}>
//               {hasChildren ? (
//                 <Box
//                   onClick={() => toggleExpand(node.id)}
//                   style={{
//                     width: 14,
//                     height: 14,
//                     border: "1px solid #999",
//                     borderRadius: 2,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontSize: 10,
//                     cursor: "pointer",
//                     userSelect: "none",
//                     backgroundColor: "#fff",
//                     transform: "translateY(-3px)", // đẩy lên một chút để thẳng hàng checkbox
//                   }}
//                   title={isExpanded ? "Thu gọn" : "Mở rộng"}
//                 >
//                   {isExpanded ? "−" : "+"}
//                 </Box>
//               ) : (
//                 <Box w={14} />
//               )}

//               {/* Checkbox + icon + tên */}
//               <Checkbox
//                 checked={isSelected}
//                 onChange={() => toggleSelection(node.id)}
//                 color="blue"
//                 size="xs"
//                 label={
//                   <Group gap={6}>
//                     {level === 0 ? (
//                       <IconBuildingCommunity size={16} color="#1c7ed6" />
//                     ) : hasChildren ? (
//                       <IconFolder size={15} color="#339af0" />
//                     ) : (
//                       <IconBuilding size={14} color="#74c0fc" />
//                     )}
//                     <Text
//                       fz="sm"
//                       fw={500}
//                       c={isSelected ? "blue" : "gray.8"}
//                       style={{ userSelect: "none" }}
//                     >
//                       {node.name}
//                     </Text>
//                   </Group>
//                 }
//               />
//             </Group>

//             {/* Hiển thị con khi expand */}
//             {hasChildren && isExpanded && (
//               <div style={{ marginLeft: 14 }}>
//                 {renderTree(node.children!, level + 1, isLastChild)}
//               </div>
//             )}
//           </Box>
//         );
//       })}
//     </Stack>
//   );

//   return (
//     <Modal
//       opened={opened}
//       onClose={onClose}
//       size="lg"
//       radius="md"
//       centered
//       overlayProps={{ blur: 2, opacity: 0.3 }}
//       title={
//         <Text fw={600} fz="lg" c="blue">
//           Cập nhật tổ chức cán bộ
//         </Text>
//       }
//     >
//       <Stack gap="md">
//         <ScrollArea h={480} offsetScrollbars>
//           <Stack>{renderTree(organizationTree)}</Stack>
//         </ScrollArea>

//         <Group justify="flex-end" mt="sm">
//           <Button variant="default" onClick={onClose}>
//             Hủy
//           </Button>
//           <Button
//             color="blue"
//             onClick={() => {
//               const selectedOrgs = findSelectedNodes(
//                 organizationTree,
//                 selected
//               );
//               onSave(selectedOrgs);
//               onClose();
//             }}
//           >
//             Lưu thay đổi
//           </Button>
//         </Group>
//       </Stack>
//     </Modal>
//   );
// }

// function findSelectedNodes(tree: OrgNode[], selectedIds: number[]): OrgNode[] {
//   const result: OrgNode[] = [];
//   for (const node of tree) {
//     if (selectedIds.includes(node.id)) result.push(node);
//     if (node.children?.length)
//       result.push(...findSelectedNodes(node.children, selectedIds));
//   }
//   return result;
// }

"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Stack,
  Checkbox,
  Group,
  Button,
  Text,
  ScrollArea,
  Box,
  Card,
} from "@mantine/core";
import {
  IconBuildingCommunity,
  IconBuilding,
  IconFolder,
} from "@tabler/icons-react";
import { showNoti } from "@/components/common/showNoti";
import { updateOrganizationsByAccount } from "@/services/organizations/OrganizationsService";

interface OrgNode {
  id: number;
  name: string;
  children?: OrgNode[];
}

interface UpdateOrganizationModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (selectedOrgs: OrgNode[]) => void;
  organizationTree: OrgNode[];
  selectedIds?: number[];
  accountId: number; //
  onSuccess?: () => void | Promise<void>;
}

export default function UpdateOrganizationModal({
  opened,
  onClose,
  onSave,
  organizationTree,
  selectedIds = [],
  accountId,
  onSuccess,
}: UpdateOrganizationModalProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  //  Khi modal mở → set checked + expand cha của node được chọn
  useEffect(() => {
    if (!opened || !organizationTree?.length) return;
    setSelected(selectedIds);

    const expandSet = new Set<number>();

    const markExpandParents = (
      nodes: OrgNode[],
      parentChain: number[] = []
    ) => {
      nodes.forEach((n) => {
        if (selectedIds.includes(n.id)) {
          parentChain.forEach((pid) => expandSet.add(pid));
        }
        if (n.children?.length) {
          markExpandParents(n.children, [...parentChain, n.id]);
        }
      });
    };

    markExpandParents(organizationTree);
    setExpanded(expandSet);
  }, [opened, selectedIds, organizationTree]);

  const toggleSelection = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  //  Hàm xử lý khi nhấn "Lưu thay đổi"
  const handleUpdateOrganizationsByAccount = async () => {
    const selectedOrgs = findSelectedNodes(organizationTree, selected);
    const orgIds = selectedOrgs.map((o) => o.id);
    if (!accountId) {
      showNoti("warning", "Không xác định được accountId để cập nhật.");
      return;
    }

    try {
      setSaving(true);
      const res = await updateOrganizationsByAccount(accountId, orgIds);
      if (res?.status === "OK") {
        showNoti("info", "Cập nhật danh sách tổ chức thành công!");
        onSave(selectedOrgs);
        // GỌI LẠI CALLBACK TỪ DRAWER
        if (onSuccess) await onSuccess();
        onClose();
      } else {
        showNoti("warning", "Không thể cập nhật danh sách tổ chức.");
      }
    } catch (error: any) {
      console.error("Lỗi khi cập nhật tổ chức:", error);

      showNoti("warning", "Không thể kết nối máy chủ.");
    } finally {
      setSaving(false);
    }
  };

  const renderTree = (nodes: OrgNode[], level = 0) => (
    <Stack gap={0} ml={level > 0 ? 16 : 0}>
      {nodes.map((n) => {
        const hasChildren = n.children && n.children.length > 0;
        const isExpanded = expanded.has(n.id);
        const isChecked = selected.includes(n.id);
        return (
          <Box key={n.id} style={{ paddingLeft: level > 0 ? 16 : 0 }}>
            <Group gap={4} py={4}>
              {hasChildren ? (
                <Box
                  onClick={() => toggleExpand(n.id)}
                  style={{
                    width: 14,
                    height: 14,
                    border: "1px solid #999",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    cursor: "pointer",
                    userSelect: "none",
                    backgroundColor: "#fff",
                    transform: "translateY(-3px)", // đẩy lên một chút để thẳng hàng checkbox
                  }}
                >
                  {isExpanded ? "−" : "+"}
                </Box>
              ) : (
                <Box w={14} />
              )}

              <Checkbox
                checked={isChecked}
                onChange={() => toggleSelection(n.id)}
                color="blue"
                size="xs"
                label={
                  <Group gap={6}>
                    {level === 0 ? (
                      <IconBuildingCommunity size={15} color="#1c7ed6" />
                    ) : hasChildren ? (
                      <IconFolder size={14} color="#339af0" />
                    ) : (
                      <IconBuilding size={13} color="#74c0fc" />
                    )}
                    <Text fz="sm" fw={500} c={isChecked ? "blue" : "gray.8"}>
                      {n.name}
                    </Text>
                  </Group>
                }
              />
            </Group>

            {hasChildren && isExpanded && (
              <div style={{ marginLeft: 14 }}>
                {renderTree(n.children!, level + 1)}
              </div>
            )}
          </Box>
        );
      })}
    </Stack>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      radius="md"
      centered
      overlayProps={{ blur: 2, opacity: 0.3 }}
      title={
        <Box>
          <Text fw={600} fz="lg" c="blue">
            Cập nhật tổ chức cán bộ
          </Text>
        </Box>
      }
    >
      <Stack gap="md">
        <Card
          withBorder
          radius="md"
          shadow="xs"
          style={{ paddingTop: "1.8rem" }}
        >
          <ScrollArea h={480}>{renderTree(organizationTree)}</ScrollArea>
        </Card>

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Hủy
          </Button>
          <Button
            color="blue"
            loading={saving}
            onClick={handleUpdateOrganizationsByAccount}
          >
            Lưu thay đổi
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function findSelectedNodes(tree: OrgNode[], ids: number[]): OrgNode[] {
  const result: OrgNode[] = [];
  for (const n of tree) {
    if (ids.includes(n.id)) result.push(n);
    if (n.children?.length) result.push(...findSelectedNodes(n.children, ids));
  }
  return result;
}
