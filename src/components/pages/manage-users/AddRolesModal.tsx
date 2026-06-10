"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Group,
  Modal,
  ScrollArea,
  Table,
  TextInput,
  Checkbox,
  Stack,
  Title,
  Text,
  Center,
  Card,
  Box,
} from "@mantine/core";
import { updateOrganizationAccountRoles } from "@/services/role/roleService";
import { showNoti } from "@/components/common/showNoti";

interface Role {
  id: number;
  name: string;
  description?: string;
  checked?: boolean;
  roleId?: number;
  roleName?: string;
  roleDescription?: string;
}

interface AddRolesModalProps {
  opened: boolean;
  onClose: () => void;
  userId: number;
  organizationId: number;
  selectedRoleIds?: number[];
  onSave: (payload: {
    userId: number;
    organizationId: number;
    selectedRoles: Role[];
  }) => void;

  allRoles?: Role[];
  loading?: boolean;

  onSuccess?: () => void | Promise<void>;
}

export default function AddRolesModal({
  opened,
  onClose,
  userId,
  organizationId,
  selectedRoleIds = [],
  onSave,
  allRoles = [],
  loading = false,
  onSuccess,
}: AddRolesModalProps) {
  const [search, setSearch] = useState("");
  const [tempRoles, setTempRoles] = useState<Role[]>([]);

  // Khởi tạo lại khi mở modal
  useEffect(() => {
    if (opened) {
      setTempRoles(
        allRoles.map((r) => ({
          id: r.roleId || r.id,
          name: r.roleName || r.name || "",
          description: r.roleDescription || r.description || "",
          checked: selectedRoleIds.includes(r.roleId || r.id),
        })),
      );
    }
  }, [opened, allRoles, selectedRoleIds]);

  const handleToggle = (id: number) => {
    setTempRoles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, checked: !r.checked } : r)),
    );
  };

  const handleSave = async () => {
    try {
      const selected = tempRoles.filter((r) => r.checked);
      const roleIds = selected.map((r) => r.id);

      // Gọi API cập nhật vai trò
      const res = await updateOrganizationAccountRoles(
        organizationId,
        userId,
        roleIds,
      );

      if (res?.status === "OK") {
        showNoti("info", "Cập nhật vai trò thành công!");
      } else {
        console.warn(" Cập nhật vai trò thất bại:", res);
      }

      // Cập nhật lại giao diện bên ngoài
      if (onSuccess) await onSuccess();
    } catch (err) {
      console.error("  Lỗi khi cập nhật vai trò:", err);
    } finally {
      onClose();
    }
  };

  const filtered = tempRoles.filter((r) => {
    const name = r.name || (r as any).roleName || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      centered
      radius="md"
      overlayProps={{ blur: 2, opacity: 0.3 }}
      title={
        <Box>
          <Text fw={600} fz="lg" c="blue" component="div">
            Thêm vai trò cho tổ chức
          </Text>
        </Box>
      }
    >
      <Stack gap="md">
        <TextInput
          placeholder="Tìm kiếm theo tên vai trò"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />{" "}
        <Card
          withBorder
          radius="md"
          shadow="xs"
          style={{ paddingTop: "1.8rem" }}
        >
          {loading ? (
            <Center h={300}>
              <Text c="dimmed">Đang tải danh sách vai trò...</Text>
            </Center>
          ) : (
            <ScrollArea h={400}>
              <Table
                striped={"even"}
                highlightOnHover
                withColumnBorders
                verticalSpacing="xs"
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th ta={"center"} style={{ width: 50 }}>
                      STT
                    </Table.Th>
                    <Table.Th ta={"center"}>Tên vai trò</Table.Th>
                    <Table.Th ta={"center"}>Mô tả</Table.Th>
                    <Table.Th style={{ width: 80 }} ta={"center"}>
                      Chọn
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {filtered.map((role, i) => (
                    <Table.Tr key={role.id}>
                      <Table.Td>{i + 1}</Table.Td>
                      <Table.Td>{role.name}</Table.Td>
                      <Table.Td>{role.description}</Table.Td>
                      <Table.Td>
                        <Center>
                          <Checkbox
                            checked={role.checked}
                            onChange={() => handleToggle(role.id)}
                          />
                        </Center>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Card>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button color="blue" onClick={handleSave}>
            Cập nhật
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
