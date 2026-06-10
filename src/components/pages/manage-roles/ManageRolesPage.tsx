/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import {
  ActionIcon,
  Avatar,
  Button,
  Card,
  Group,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
  Drawer,
  Textarea,
  Menu,
  Divider,
  Box,
} from "@mantine/core";
import {
  IconShield,
  IconSearch,
  IconPlus,
  IconPencil,
  IconTrash,
  IconSettings,
  IconEdit,
  IconUserMinus,
  IconUsersGroup,
} from "@tabler/icons-react";
import {
  fetchRolesPaginate,
  createRole,
  updateRole,
  deleteRole,
} from "@/services/role/roleService";
import { RoleItem } from "@/types/type-roles";
import CustomPagination from "@/components/common/CustomPagination";
import { showNoti } from "@/components/common/showNoti";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { HoverButton } from "@/components/common/HoverButton";

export default function ManageRolesPage() {
  const router = useRouter();
  const t = useTranslations("RolesManagement");
  const locale = useLocale();
  // Danh sách vai trò
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({
    roleId: 0,
    roleName: "",
    roleDescription: "",
  });
  const [isEdit, setIsEdit] = useState(false);

  // Confirm delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRoleDelete, setSelectedRoleDelete] = useState<RoleItem | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  // === Fetch list ===
  const _fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetchRolesPaginate(page, pageSize, searchText || "*");
      const data = res?.payload;
      setRoles(data?.items || []);
      setTotalItems(data?.totalElements || 0);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error("Error loading roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    _fetchRoles();
  }, [page, pageSize]);

  // === Drawer: Add / Edit ===
  const openAddDrawer = () => {
    setForm({ roleId: 0, roleName: "", roleDescription: "" });
    setIsEdit(false);
    setDrawerOpen(true);
  };

  const openEditDrawer = (r: RoleItem) => {
    setForm({
      roleId: r.roleId,
      roleName: r.roleName ?? "",
      roleDescription: r.roleDescription ?? "",
    });
    setIsEdit(true);
    setDrawerOpen(true);
  };

  // === Save ===
  const handleSave = async () => {
    if (!form.roleName.trim()) {
      showNoti("warning", "Tên vai trò không được để trống.");
      return;
    }

    try {
      setLoading(true);

      if (isEdit && form.roleId) {
        await updateRole(form.roleId, {
          roleName: form.roleName,
          roleDescription: form.roleDescription,
        });
        showNoti(
          "success",
          `Đã cập nhật vai trò "${form.roleName}" thành công!`
        );
      } else {
        await createRole({
          roleName: form.roleName,
          roleDescription: form.roleDescription,
        });
        showNoti(
          "success",
          `Đã tạo mới vai trò "${form.roleName}" thành công!`
        );
      }

      setDrawerOpen(false);
      _fetchRoles();
    } catch (error: any) {
      //  Xử lý lỗi chi tiết từ backend
      const apiError = error?.response?.data;

      if (apiError?.errors && Array.isArray(apiError.errors)) {
        // Nếu backend trả về mảng lỗi chi tiết
        apiError.errors.forEach((err: any) => {
          if (err?.message) showNoti("warning", err.message);
        });
      } else if (apiError?.message) {
        // Nếu backend chỉ có message
        showNoti("warning", apiError.message);
      } else {
        // Fallback: lỗi chung
        showNoti("warning", "Không thể lưu thông tin. Vui lòng thử lại.");
      }

      console.error("Error saving role:", error);
    } finally {
      setLoading(false);
    }
  };

  // === Delete ===
  const handleDelete = (r: RoleItem) => {
    setSelectedRoleDelete(r);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRoleDelete) return;
    try {
      setDeleting(true);
      await deleteRole(selectedRoleDelete.roleId);
      showNoti(
        "success",
        `Đã xóa vai trò "${selectedRoleDelete.roleName}" thành công!`
      );
      setConfirmOpen(false);
      _fetchRoles();
    } catch (error) {
      showNoti("warning", "Không thể xóa vai trò. Vui lòng thử lại.");
    } finally {
      setDeleting(false);
    }
  };

  // === Change Handlers ===
  const handleChangeRoleName: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => setForm((f) => ({ ...f, roleName: e.target.value }));

  const handleChangeRoleDesc: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e
  ) => setForm((f) => ({ ...f, roleDescription: e.target.value }));

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between" align="flex-end">
        <Group>
          <Avatar radius="sm" color="indigo">
            <IconShield size={18} />
          </Avatar>
          <Title order={3}>{t("title")}</Title>
        </Group>
      </Group>

      {/* Bộ lọc */}
      <Card withBorder radius="lg" p="lg" shadow="sm">
        <Group wrap="wrap" justify="flex-end">
          <TextInput
            label={" "}
            leftSection={<IconSearch size={16} />}
            placeholder="Tìm theo tên vai trò..."
            value={searchText}
            onChange={(e) => setSearchText(e.currentTarget.value)}
            w={260}
            style={{ flex: 1 }}
          />
          <Button
            mt={23}
            leftSection={<IconSearch size={16} />}
            onClick={() => {
              setPage(1);
              _fetchRoles();
            }}
          >
            Tìm
          </Button>
        </Group>
      </Card>

      {/* Nút thêm */}
      <Group justify="flex-end">
        <Button leftSection={<IconPlus size={16} />} onClick={openAddDrawer}>
          Thêm vai trò
        </Button>
      </Group>

      {/* Bảng */}
      <Card withBorder radius="lg" p="lg" shadow="sm">
        <Table highlightOnHover striped="even" withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={80} ta="center">
                #
              </Table.Th>
              <Table.Th ta="center">Tên vai trò</Table.Th>
              <Table.Th ta="center">Mô tả</Table.Th>
              <Table.Th w="12%" ta="center">
                Hành động
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {roles.length > 0 ? (
              roles.map((r, i) => (
                <Table.Tr key={r.guid}>
                  <Table.Td ta="center">
                    {(page - 1) * pageSize + i + 1}
                  </Table.Td>
                  <Table.Td>
                    <Text c="blue">{r.roleName}</Text>
                  </Table.Td>
                  <Table.Td>{r.roleDescription || "—"}</Table.Td>
                  <Table.Td ta="center">
                    <Group
                      justify="center"
                      gap="sm"
                      wrap="wrap"
                      data-stop-propagation
                    >
                      <HoverButton
                        color="green"
                        icon={<IconUsersGroup size={16} />}
                        label="Quản lý chức năng, phân quyền"
                        onClick={() => {
                          router.push(
                            `/${locale}/manage-roles/manage-permissions?roleId=${r.roleId}`
                          );
                        }}
                      />
                      <HoverButton
                        color="blue"
                        icon={<IconEdit size={16} />}
                        label="Cập nhật"
                        onClick={() => openEditDrawer(r)}
                      />

                      <HoverButton
                        color="red"
                        icon={<IconTrash size={16} />}
                        label="Xóa"
                        onClick={() => handleDelete(r)}
                      />
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text c="dimmed" ta="center">
                    Không có vai trò nào phù hợp.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Phân trang */}
      <Group justify="right" mt="md">
        <CustomPagination
          totalItems={totalItems}
          totalPages={totalPages}
          page={page}
          pageSize={pageSize}
          setPage={setPage}
          setPageSize={setPageSize}
        />
      </Group>

      {/* Confirm xóa */}
      <ConfirmDialog
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa vai trò"
        message={`Bạn có chắc chắn muốn xóa vai trò "${
          selectedRoleDelete?.roleName || ""
        }" không?`}
        reloginLabel="Hủy"
        continueLabel="Xóa"
        loading={deleting}
      />

      {/* Drawer thêm/sửa */}
      <Drawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="right"
        size="md"
        title={
          <Box>
            <Title order={4}>
              {isEdit ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
            </Title>
          </Box>
        }
      >
        <Stack gap="md">
          <TextInput
            label="Tên vai trò"
            value={form.roleName}
            onChange={handleChangeRoleName}
          />
          <Textarea
            label="Mô tả"
            value={form.roleDescription}
            onChange={handleChangeRoleDesc}
          />
          <Group justify="right" mt="md">
            <Button variant="default" onClick={() => setDrawerOpen(false)}>
              Hủy
            </Button>
            <Button loading={loading} onClick={handleSave}>
              {isEdit ? "Cập nhật" : "Thêm mới"}
            </Button>
          </Group>
        </Stack>
      </Drawer>
    </Stack>
  );
}
