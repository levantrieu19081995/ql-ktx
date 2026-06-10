"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  Drawer,
  Group,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconFile,
  IconKey,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { showNoti } from "@/components/common/showNoti";
import { fetchPermissionsByRole } from "@/services/permission/permissionService";
import { FunctionPermission } from "@/types/type-permissions";
import {
  updateRolePermissions,
  deleteRolePermissions,
  createRolePermissions,
} from "@/services/role-permisstion/rolePermisstionService";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

interface ChucNangNotInRole {
  value: number;
  label: string;
  permission: any[];
}
export default function ManagePermissionsPage() {
  const t = useTranslations("PermissionsManagement");
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleId = Number(searchParams?.get("roleId") ?? 0);

  const [permissions, setPermissions] = useState<FunctionPermission[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<
    FunctionPermission[]
  >([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isChanged, setIsChanged] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [availablePermissions, setAvailablePermissions] = useState<any>({});
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
    []
  );
  const [searchText, setSearchText] = useState("");

  const [danhMucChucNangNotInRole, setDanhMucChucNangNotInRole] = useState<
    ChucNangNotInRole[]
  >([]);

  // === Load quyền theo vai trò ===
  const loadPermissions = async (roleId: number) => {
    try {
      // Gọi API để lấy danh sách quyền của vai trò
      const res = await fetchPermissionsByRole(roleId);

      // Tạo mảng chứa các quyền đã phân bổ và chưa phân bổ
      const arrChucNangPermission: any[] = [];
      const arrChucNangNotPermission: any[] = [];
      const idChucNangCheckAll: number[] = [];

      // Lọc và phân loại các chức năng quyền
      res.payload?.forEach((chucNang: any) => {
        const CheckFullPermission: any = [];

        // Kiểm tra quyền đã được chọn
        chucNang.listPermission.forEach((per: any) => {
          if (per.checked === true) {
            CheckFullPermission.push(per.psId);
          }
        });

        // Nếu tất cả quyền đã được chọn thì thêm vào danh sách các chức năng đã phân quyền
        if (CheckFullPermission.length === chucNang.listPermission.length) {
          idChucNangCheckAll.push(chucNang.dmcnId);
        }

        // Nếu quyền không trống, thêm vào danh sách đã phân quyền
        if (CheckFullPermission.length > 0) {
          arrChucNangPermission.push(chucNang);
        } else {
          // Nếu quyền chưa được chọn, thêm vào danh sách chưa phân quyền
          arrChucNangNotPermission.push({
            value: chucNang.dmcnId,
            label: chucNang.dmcnName,
            permission: chucNang.listPermission,
          });
        }
      });

      // Cập nhật state
      setPermissions(arrChucNangPermission); // Cập nhật danh sách  Các quyền đã phân bổ
      setDanhMucChucNangNotInRole(arrChucNangNotPermission); // Các quyền chưa phân bổ

      setOriginalPermissions(JSON.parse(JSON.stringify(arrChucNangPermission))); // Lưu lại quyền phân bổ  ban đầu
      setIsChanged(false);
    } catch (error) {
      console.error("Lỗi khi load quyền vai trò:", error);
    }
  };

  // === So sánh khác biệt giữa permissions và bản gốc ===
  const checkIfChanged = (current: any[], original: any[]) => {
    return JSON.stringify(current) !== JSON.stringify(original);
  };

  // === Toggle chọn dòng ===
  const handleToggleRow = (dmcnId: number, checked: boolean) => {
    setSelectedRows((prev) =>
      checked ? [...prev, dmcnId] : prev.filter((id) => id !== dmcnId)
    );
  };

  // === Toggle checkbox quyền ===
  const handleTogglePermission = (
    dmcnId: number,
    psId: number,
    checked: boolean
  ) => {
    const updated = permissions.map((func) =>
      func.dmcnId === dmcnId
        ? {
            ...func,
            listPermission: func.listPermission.map((perm) =>
              perm.psId === psId ? { ...perm, checked } : perm
            ),
          }
        : func
    );
    setPermissions(updated);
    setIsChanged(checkIfChanged(updated, originalPermissions));
  };

  // === Mở hộp thoại xác nhận xóa ===
  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      showNoti("warning", "Vui lòng chọn ít nhất một chức năng để xóa!");
      return;
    }
    setConfirmOpen(true);
  };

  // === Xác nhận xóa (gọi API thật) ===
  const handleDeleteConfirm = async () => {
    try {
      const permissionIdsToDelete = permissions
        .filter((func) => selectedRows.includes(func.dmcnId))
        .flatMap((func) => func.listPermission.map((perm) => perm.psId));

      if (permissionIdsToDelete.length === 0) {
        showNoti("warning", "Không có quyền nào để xóa!");
        setConfirmOpen(false);
        return;
      }

      await deleteRolePermissions(roleId, permissionIdsToDelete);

      const updated = permissions.filter(
        (item) => !selectedRows.includes(item.dmcnId)
      );
      setPermissions(updated);
      setSelectedRows([]);
      setIsChanged(checkIfChanged(updated, originalPermissions));
      showNoti("success", "Đã xóa chức năng đã chọn!");
    } catch (error) {
      showNoti("error", "Không thể xóa quyền. Vui lòng thử lại!");
      console.error(error);
    } finally {
      setConfirmOpen(false);
    }
  };

  // === Lưu quyền ===
  const handleSavePermissions = async () => {
    try {
      const permissionIds = permissions
        .flatMap((func) => func.listPermission)
        .filter((perm) => perm.checked)
        .map((perm) => perm.psId);

      await updateRolePermissions(roleId, permissionIds);
      showNoti("success", "Đã lưu các quyền của vai trò thành công!");
      setOriginalPermissions(JSON.parse(JSON.stringify(permissions)));
      setIsChanged(false);
    } catch (error) {
      showNoti("error", "Không thể lưu quyền vai trò. Vui lòng thử lại!");
      console.error(error);
    }
  };

  // === Mở Drawer thêm quyền ===
  const openAddDrawer = () => {
    setDrawerOpen(true);
    setSelectedFunction(null);
    setAvailablePermissions({});
    setSelectedPermissionIds([]);
  };

  // === Khi chọn chức năng trong Drawer ===
  const handleSelectFunction = (dmcnId: string | null) => {
    setSelectedFunction(dmcnId);
    if (!dmcnId) return;

    // Tìm chức năng trong danh sách chức năng chưa phân bổ
    const selectedFunction = danhMucChucNangNotInRole.find(
      (item: any) => String(item.value) === String(dmcnId) // Đảm bảo so sánh kiểu chuỗi
    );

    // Nếu tìm thấy chức năng, chỉ cần lấy label để hiển thị
    if (selectedFunction) {
      setAvailablePermissions(selectedFunction.permission); // Lấy quyền chưa phân bổ từ selectedFunction
    }
  };

  // === Toggle quyền trong Drawer ===
  const handleToggleAddPermission = (psId: number, checked: boolean) => {
    setSelectedPermissionIds((prev) =>
      checked ? [...prev, psId] : prev.filter((id) => id !== psId)
    );
  };

  // === Lưu quyền mới từ Drawer ===
  const handleConfirmAdd = async () => {
    if (!selectedFunction || selectedPermissionIds.length === 0) {
      showNoti("warning", "Vui lòng chọn chức năng và ít nhất một quyền!");
      return;
    }

    try {
      const res = await createRolePermissions(roleId, selectedPermissionIds);
      if (res.status === "OK") {
        await loadPermissions(roleId);
        showNoti("success", "Đã thêm quyền cho vai trò thành công!");
        setDrawerOpen(false);
        setSelectedFunction(null);
        setSelectedPermissionIds([]);
      } else {
        showNoti("warning", res.message || "Có lỗi khi thêm quyền!");
      }
    } catch (error) {
      console.error("Lỗi khi thêm quyền:", error);
      showNoti("error", "Không thể lưu quyền mới. Vui lòng thử lại!");
    }
  };

  useEffect(() => {
    if (roleId) loadPermissions(roleId);
  }, [roleId]);

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Group>
          <Avatar radius="sm" color="indigo">
            <IconKey size={18} />
          </Avatar>
          <Title order={3}>{t("title")}</Title>
        </Group>
      </Group>

      {/* Nút thao tác */}
      <Group justify="space-between">
        <Group>
          <Button
            variant="light"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => {
              router.push("/vi/manage-roles");
            }}
          >
            Trở về
          </Button>
        </Group>
        <Group>
          <Button
            color="#04427D"
            leftSection={<IconFile size={16} />}
            onClick={handleSavePermissions}
            disabled={!isChanged}
          >
            Lưu các quyền của vai trò
          </Button>

          <Button
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={handleDeleteSelected}
            disabled={selectedRows.length <= 0}
          >
            Xóa chức năng đã chọn ({selectedRows.length})
          </Button>

          <Button leftSection={<IconPlus size={16} />} onClick={openAddDrawer}>
            Thêm quyền (Chức năng)
          </Button>
        </Group>
      </Group>

      {/* Bảng quyền */}
      <Card withBorder radius="lg" p="lg" shadow="sm">
        <Table highlightOnHover striped="even" withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th ta="center" w={60}>
                STT
              </Table.Th>
              <Table.Th>Chức năng</Table.Th>
              <Table.Th ta="center">Các quyền của vai trò</Table.Th>
              <Table.Th ta="center" w={120}>
                Chọn để xóa
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {permissions.map((func, index) => (
              <Table.Tr key={func.dmcnId}>
                <Table.Td ta="center">{index + 1}</Table.Td>

                <Table.Td>
                  <Text fw={500} c="blue">
                    {func.dmcnName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {func.dmcnSlug}
                  </Text>
                </Table.Td>

                <Table.Td>
                  <Group gap="md" wrap="wrap">
                    {func.listPermission.map((perm) => (
                      <Checkbox
                        key={perm.psId}
                        label={perm.psDescription || perm.psName}
                        checked={perm.checked}
                        onChange={(e) =>
                          handleTogglePermission(
                            func.dmcnId,
                            perm.psId,
                            e.currentTarget.checked
                          )
                        }
                      />
                    ))}
                  </Group>
                </Table.Td>

                <Table.Td ta="center">
                  <Center>
                    <Checkbox
                      checked={selectedRows.includes(func.dmcnId)}
                      onChange={(e) =>
                        handleToggleRow(func.dmcnId, e.currentTarget.checked)
                      }
                    />
                  </Center>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Drawer Thêm quyền */}
      <Drawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          <Box>
            <Title order={4} c={"blue"}>
              Thêm quyền cho chức năng
            </Title>
          </Box>
        }
        size="40%"
        position="right"
      >
        <Stack>
          <Select
            label="Chọn chức năng"
            placeholder="Chọn một chức năng"
            data={danhMucChucNangNotInRole.map((item) => ({
              value: String(item.value),
              label: String(item.label),
            }))}
            value={selectedFunction}
            onChange={handleSelectFunction}
            searchable
            nothingFoundMessage="Không tìm thấy chức năng"
          />

          {selectedFunction && (
            <>
              <Text fw={600} mt="md">
                Thêm quyền cho chức năng{" "}
                <Text span c="blue">
                  {
                    danhMucChucNangNotInRole.find(
                      (item: any) =>
                        String(item.value) === String(selectedFunction)
                    )?.label
                  }
                </Text>
              </Text>

              <TextInput
                placeholder="Tìm kiếm quyền"
                value={searchText}
                onChange={(e) => setSearchText(e.currentTarget.value)}
              />

              <Stack mt="xs" gap="xs">
                {availablePermissions
                  .filter((perm: any) =>
                    (perm.psDescription || perm.psName)
                      .toLowerCase()
                      .includes(searchText.toLowerCase())
                  )
                  .map((perm: any) => (
                    <Checkbox
                      key={perm.psId}
                      label={perm.psDescription || perm.psName}
                      checked={selectedPermissionIds.includes(perm.psId)}
                      onChange={(e) =>
                        handleToggleAddPermission(
                          perm.psId,
                          e.currentTarget.checked
                        )
                      }
                    />
                  ))}
              </Stack>

              <Group justify="flex-end" mt="lg">
                <Button variant="light" onClick={() => setDrawerOpen(false)}>
                  Hủy
                </Button>
                <Button color="blue" onClick={handleConfirmAdd}>
                  Thêm quyền đã chọn
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Drawer>

      {/*  Hộp thoại xác nhận xóa */}
      <ConfirmDialog
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa quyền"
        message={`Bạn có chắc chắn muốn xóa ${selectedRows.length} chức năng khỏi vai trò không?`}
        reloginLabel="Hủy"
        continueLabel="Xóa"
      />
    </Stack>
  );
}
