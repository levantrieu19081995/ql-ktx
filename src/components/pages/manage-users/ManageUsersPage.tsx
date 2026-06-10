/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Menu,
  Popover,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import {
  IconUsersGroup,
  IconPlus,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";

import { useTranslations } from "next-intl";
import {
  __findAccountByUsernameAndType,
  deleteUser,
  fetchUsersByOrganizationId,
} from "@/services/account/accountService";

import "@mantine/notifications/styles.css";

import type { Role, Status, FetchUsersRequest, UserItem } from "@/types/global";

import AccountDetailModal from "./AccountDetailModal";
import AccountUpdateDrawer from "./AccountUpdateDrawer";
import { __updateUserById } from "@/services/ca-nhan/caNhanService";
import dayjs from "dayjs";
import { showNoti } from "@/components/common/showNoti";
import AccountTable from "./AccountTable";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { deleteAccountsFromOrganization } from "@/services/organizations/OrganizationsService";
import OrganizationSelectDialog from "./OrganizationSelectDialog";

export default function ManageUsersPage() {
  const t = useTranslations("Manage-users");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userForm, setUserForm] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);

  // mở drawer thêm
  function openAdd() {
    setUserForm({});
    setIsEditing(false);
    setDrawerOpen(true);
  }

  // mở drawer sửa
  function openEdit(user: UserItem) {
    setIsEditing(true);
    setDrawerOpen(true);

    // Gọi API lấy chi tiết cán bộ theo GUID
    __findAccountByUsernameAndType(user.guid)
      .then((res) => {
        const data = res.payload || {};

        setUserForm({
          id: data.id || -1,
          username: data.username || "",
          staffCode: data.caNhan?.maso || "",
          name: data.caNhan?.ten || "",
          email: data.email || "",
          cmnd: data.caNhan?.cmnd || "",
          cccd: data.caNhan?.cccd || "",
          phone: data.caNhan?.sdt || "",
          address: data.caNhan?.diaChi || "",
          city: data.caNhan?.thanhPhoId?.toString() || "",
          district: data.caNhan?.huyenId?.toString() || "",
          ward: data.caNhan?.phuongId?.toString() || "",
          gender: data.caNhan?.gioiTinh?.toString() || "",
          ethnicity: data.caNhan?.dtMa || "",
          nationality: data.caNhan?.qtMa || "",
          birth: data.caNhan?.ngaySinh
            ? new Date(Date.parse(data.caNhan.ngaySinh)).toLocaleDateString(
                "vi-VN"
              )
            : "",
        });
      })
      .catch((err) => console.error("Lỗi lấy thông tin cán bộ:", err));
  }

  const [detailGuid, setDetailGuid] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<
    { org: string; role: string }[]
  >([]);

  // const [rows, setRows] = useState<User[]>([]);
  const [rows, setRows] = useState<UserItem[]>([]);

  // filters
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "-1">("-1");
  const [statusFilter, setStatusFilter] = useState<Status | "-1">("-1");

  // pagination
  const [pageSize] = useState<number>(5);
  const [page, setPage] = useState(1);

  // modal create/edit

  function resetFilters() {
    setName("");
    setEmail("");
    setRoleFilter("-1");
    setStatusFilter("-1");
    setPage(1);
  }

  // hàm load dữ liệu user
  const loadUsers = async (
    customPage = page,
    customPageSize = pageSize,
    customFilters?: Partial<FetchUsersRequest>
  ) => {
    try {
      const filters: Partial<FetchUsersRequest> = {
        page: customPage,
        pageSize: customPageSize,
        organizationId: 6148,
        roleId: Number(roleFilter) || 0,
        status: Number(statusFilter) || 1,
        accountType: 1,
        filter: name || email ? `${name || ""} ${email || ""}`.trim() : "",
        ...customFilters,
      };

      const res = await fetchUsersByOrganizationId(filters);

      // cập nhật danh sách người dùng
      setRows(res.payload.items);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu người dùng:", error);
    }
  };

  function openDetail(u: UserItem) {
    const guid = (u as any)?.guid ?? null;
    if (!guid) return;

    // Lấy roles sẵn từ user item (nếu có)
    const userRoles =
      u.organizations?.flatMap((o) =>
        (o.roles || []).map((r) => ({
          org: o.name,
          role: r.roleName,
        }))
      ) ?? [];

    setDetailGuid(guid);
    setSelectedRoles(userRoles); // thêm state lưu roles
    setDetailOpen(true);
  }

  const handleRowClick = (e: React.MouseEvent, u: UserItem) => {
    if ((e.target as HTMLElement).closest("[data-stop-propagation]")) return;
    openDetail(u);
  };

  const onSave = () => {
    const dataUser = {
      account: {
        avatar: null, // nếu có thể cập nhật sau
        email: userForm.email?.trim(),
      },
      caNhan: {
        ten: userForm.name?.trim(),
        cmnd: userForm.cmnd?.trim(),
        cccd: userForm.cccd?.trim(),
        diaChi: userForm.address?.trim(),
        gioiTinh: parseInt(userForm.gender),
        sdt: userForm.phone?.trim(),
        thanhPhoId: Number(userForm.city) || 0,
        huyenId: Number(userForm.district) || 0,
        phuongId: Number(userForm.ward) || 0,

        ngaySinh: userForm.birth
          ? dayjs(userForm.birth).format("MM/DD/YYYY")
          : "",
        maso: userForm.staffCode?.trim(),
        dtMa: userForm.ethnicity,
        qtMa: userForm.nationality,
      },
    };

    // Gọi API update
    __updateUserById(
      userForm.id || userForm.userId,
      dataUser,
      (res) => {
        showNoti(
          "info",
          `Cập nhật thông tin cán bộ ${userForm.username} thành công`
        );
        setDrawerOpen(false);
        loadUsers();
      },
      (e) => {
        console.error("Lỗi cập nhật cán bộ:", e);
        showNoti(
          "error",
          `Cập nhật thông tin cán bộ ${userForm.username} thất bại`
        );
      }
    );
  };

  // xóa tải khoản
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  // Khi click nút Xóa => mở dialog
  const handleOpenDeleteConfirm = (user: UserItem) => {
    setUserToDelete(user);
    setConfirmOpen(true);
  };

  // Khi xác nhận "Thu hồi"/"Xóa"
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setLoadingDelete(true);

    try {
      const res = await deleteUser(userToDelete.id);
      if (res?.status === "OK") {
        showNoti(
          "info",
          `Đã xóa tài khoản cán bộ "${
            userToDelete.caNhan?.ten || userToDelete.username
          }"`
        );
        // TODO: Gọi load lại danh sách user
        loadUsers();
      } else {
        showNoti("error", "Không thể xóa tài khoản. Vui lòng thử lại.");
      }
    } catch (err) {
      showNoti("error", "Không thể kết nối đến máy chủ.");
      console.error("Lỗi khi xóa tài khoản:", err);
    } finally {
      setLoadingDelete(false);
      setConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  // xóa tài khaorn khỏi phòng ban
  const [confirmDetachOpen, setConfirmDetachOpen] = useState(false);
  const [loadingDetach, setLoadingDetach] = useState(false);
  const [userToDetach, setUserToDetach] = useState<UserItem | null>(null);

  // Popup chọn đơn vị khi xóa khỏi tổ chức
  const [orgSelectOpen, setOrgSelectOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [availableOrgs, setAvailableOrgs] = useState<
    { id: number; name: string }[]
  >([]);

  const handleOpenDetachConfirm = (user: UserItem) => {
    const orgs =
      user.organizations?.map((o) => ({
        id: o.id || 0,
        name: o.name || "Chưa rõ tên",
      })) || [];

    if (orgs.length === 0) {
      showNoti("warning", "Người dùng này không thuộc đơn vị nào.");
      return;
    }

    setUserToDetach(user);
    setAvailableOrgs(orgs);
    setOrgSelectOpen(true);
  };

  const handleSelectOrgConfirm = (orgId: number) => {
    setSelectedOrgId(orgId);
    setOrgSelectOpen(false);
    setConfirmDetachOpen(true);
  };

  const handleDetachConfirm = async () => {
    if (!userToDetach || !selectedOrgId) return;
    setLoadingDetach(true);

    try {
      const res = await deleteAccountsFromOrganization(selectedOrgId, [
        userToDetach.id,
      ]);
      if (res?.status === "OK") {
        showNoti(
          "info",
          `Đã xóa người dùng "${
            userToDetach.caNhan?.ten || userToDetach.username
          }" khỏi tổ chức.`
        );
        await loadUsers();
      } else {
        showNoti("error", "Không thể xóa người dùng khỏi tổ chức.");
      }
    } catch (err) {
      console.error("Lỗi khi xóa khỏi tổ chức:", err);
      showNoti("error", "Không thể kết nối máy chủ.");
    } finally {
      setLoadingDetach(false);
      setConfirmDetachOpen(false);
      setUserToDetach(null);
      setSelectedOrgId(null);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <Group>
          <Avatar radius="sm" color="indigo">
            <IconUsersGroup size={18} />
          </Avatar>
          <Title order={3}>{t("title")}</Title>
        </Group>
      </Group>

      {/* Cụm tìm kiếm */}
      <Card withBorder radius="lg" p="lg" shadow="sm">
        <Group wrap="wrap" justify="flex-end">
          <TextInput
            label={" "}
            leftSection={<IconSearch size={16} />}
            placeholder="Tìm theo tên/email/đơn vị …"
            value={name}
            onChange={(e) => {
              setName(e.currentTarget.value);
              setPage(1);
            }}
            w={260}
            style={{ flex: 1 }}
          />

          <Select
            label="Vai trò"
            placeholder="Tất cả"
            data={[]}
            value={String(roleFilter)}
            onChange={(v: any) => setRoleFilter((v as Role | "-1") ?? "-1")}
            w={160}
          />

          <Select
            label="Trạng thái"
            data={[
              { value: "-1", label: "Tất cả" },
              { value: "1", label: "Đang hoạt động" },
              { value: "2", label: "Chờ kích hoạt" },
              { value: "0", label: "Ngưng" },
            ]}
            value={statusFilter}
            onChange={(v: string | null) => {
              setStatusFilter((v as Status | "-1") ?? "-1");
              setPage(1);
            }}
            w={180}
          />

          <Button variant="light" onClick={resetFilters} mt={23}>
            Đặt lại
          </Button>
          <Button
            mt={23}
            leftSection={<IconSearch size={16} />}
            onClick={() => {
              setPage(1); // reset về trang đầu
              loadUsers(1, pageSize);
            }}
          >
            Tìm
          </Button>
        </Group>
      </Card>

      {/* Thêm người dùng */}
      <Group wrap="wrap" justify="flex-end">
        <Button mt={23} leftSection={<IconPlus size={16} />} onClick={() => {}}>
          Thêm người dùng
        </Button>
      </Group>

      {/* Danh sách người dùng*/}
      <Card withBorder radius="lg" p="lg" shadow="sm">
        <AccountTable
          rows={rows}
          page={page}
          pageSize={pageSize}
          onEdit={openEdit}
          onRowClick={handleRowClick}
          onDeleteUser={handleOpenDeleteConfirm}
          onDetachFromOrg={handleOpenDetachConfirm}
        />
      </Card>

      {/* Drawer thêm/sửa */}
      <AccountUpdateDrawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isEditing={isEditing}
        userData={userForm}
        onChange={(field, value) =>
          setUserForm((prev: any) => ({ ...prev, [field]: value }))
        }
        onSave={() => {
          onSave();
        }}
      />

      {/* Chi tiết người dùng */}
      <AccountDetailModal
        opened={detailOpen}
        onClose={() => setDetailOpen(false)}
        accountGuid={detailGuid}
        rolesData={selectedRoles}
      />

      <ConfirmDialog
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa tài khoản"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${
          userToDelete?.caNhan?.ten || userToDelete?.username
        }" khỏi hệ thống không?`}
        reloginLabel="Hủy"
        continueLabel="Xóa"
        loading={loadingDelete}
      />

      <OrganizationSelectDialog
        opened={orgSelectOpen}
        onClose={() => setOrgSelectOpen(false)}
        userName={userToDetach?.caNhan?.ten || userToDetach?.username}
        organizations={availableOrgs}
        onConfirm={handleSelectOrgConfirm}
        loading={loadingDetach}
      />

      <ConfirmDialog
        opened={confirmDetachOpen}
        onClose={() => setConfirmDetachOpen(false)}
        onConfirm={handleDetachConfirm}
        title="Xác nhận xóa khỏi tổ chức"
        message={`Bạn có chắc chắn muốn xóa người dùng "${
          userToDetach?.caNhan?.ten || userToDetach?.username
        }" khỏi tổ chức này không?`}
        reloginLabel="Hủy"
        continueLabel="Xóa khỏi tổ chức"
        loading={loadingDetach}
      />
    </Stack>
  );
}
