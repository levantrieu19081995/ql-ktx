/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  Drawer,
  Stack,
  Group,
  Title,
  TextInput,
  Button,
  Grid,
  Radio,
  Card,
  Text,
  Table,
} from "@mantine/core";
import {
  IconBuilding,
  IconBuildingCommunity,
  IconHome,
  IconPlus,
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import UpdateOrganizationModal from "./UpdateOrganizationModal";
import AddRolesModal from "./AddRolesModal";
import {
  __organizationsFormatTree,
  fetchOrganizationsByAccount,
} from "@/services/organizations/OrganizationsService";
import { OrganizationTreeNode } from "@/types/type-organizations";
import {
  deleteOrganizationAccountRoles,
  fetchRolesPaginate,
} from "@/services/role/roleService";
import { showNoti } from "@/components/common/showNoti";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface AccountDrawerProps {
  opened: boolean;
  onClose: () => void;
  userData: any;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  isEditing?: boolean;
}
type RoleItem = { id: number; name: string; description?: string };
type OrgRolesRow = { id: number; organization: string; roles: RoleItem[] };
// ===================== Component ===================== //
export default function AccountUpdateDrawer({
  opened,
  onClose,
  userData,
  onChange,
  onSave,
  isEditing,
}: AccountDrawerProps) {
  // const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [selectedOrgs, setSelectedOrgs] = useState<any[]>([]);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<any[]>([]);
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [loadingOrg, setLoadingOrg] = useState(false);
  const [organizationTree, setOrganizationTree] = useState<any[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<number | null>(null);
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [selectedRolesByOrg, setSelectedRolesByOrg] = useState<
    Record<number, any[]>
  >({});

  const [orgRolesRows, setOrgRolesRows] = useState<OrgRolesRow[]>([]);
  const [selectedRoleIdsForModal, setSelectedRoleIdsForModal] = useState<
    number[]
  >([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{
    organizationId: number;
    roleId: number;
    roleName: string;
  } | null>(null);

  const [orgsTree, setOrgsTree] = useState<OrganizationTreeNode[]>([]);
  const userId = userData?.id || 101;

  // ===================== Component con: Tree Node ===================== //
  function OrganizationNode({
    node,
    isChild = false,
  }: {
    node: any;
    isChild?: boolean;
  }) {
    return (
      <Stack gap={4} style={{ paddingLeft: isChild ? "24px" : "0px" }}>
        <Group gap="xs">
          {isChild ? (
            <IconBuilding size={16} color="#228be6" />
          ) : (
            <IconBuildingCommunity size={16} color="#1c7ed6" />
          )}
          <Text fw={isChild ? 400 : 500}>{node.name}</Text>
        </Group>

        {node.children && node.children.length > 0 && (
          <Stack gap={4} pl="sm">
            {node.children.map((child: any) => (
              <OrganizationNode key={child.id} node={child} isChild={true} />
            ))}
          </Stack>
        )}
      </Stack>
    );
  }

  function buildOrgRolesRows(orgs: any[]): OrgRolesRow[] {
    const rows: OrgRolesRow[] = [];

    const walk = (nodes: any[]) => {
      nodes.forEach((n) => {
        // nếu node có roles thì đưa 1 hàng vào bảng
        const rolesArr: RoleItem[] =
          (n.roles || []).map((r: any) => ({
            id: Number(r.roleId ?? r.roleid ?? r.id),
            name: String(r.roleName ?? r.rolename ?? r.name ?? ""),
            description: r.roleDescription ?? r.roledescription ?? "",
          })) || [];

        // if (rolesArr.length > 0) {
        rows.push({
          id: Number(n.id),
          organization: String(n.name ?? ""),
          roles: rolesArr,
        });
        // }

        // Đệ quy tiếp cho các con
        if (n.children?.length) walk(n.children);
      });
    };

    walk(orgs);
    return rows;
  }

  const handleSaveRoles = ({
    userId,
    organizationId,
    selectedRoles,
  }: {
    userId: number;
    organizationId: number;
    selectedRoles: any[];
  }) => {
    setSelectedRolesByOrg((prev) => ({
      ...prev,
      [organizationId]: selectedRoles,
    }));
  };

  const handleOpenOrgModal = async () => {
    try {
      setLoadingOrg(true);

      // Lấy toàn bộ cây tổ chức
      const resTree = await __organizationsFormatTree(1, { type: "*" });
      if (resTree.status === "OK" && resTree.payload) {
        setOrgsTree([resTree.payload]);
      }

      // Lấy danh sách tổ chức hiện tại của user
      const resAccount = await fetchOrganizationsByAccount({
        acocuntId: userData?.id || 101,
        type: "*",
        fetchOrganizationRole: true,
      });

      if (resAccount.status === "OK" && resAccount.payload) {
        const orgs = resAccount.payload;

        // Gộp toàn bộ ID từ organizationTree để truyền sang modal
        const ids = collectOrgIds(orgs);
        setSelectedOrgs(ids.map((id) => ({ id })));
      }

      setOrgModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi mở modal tổ chức:", error);
    } finally {
      setLoadingOrg(false);
    }
  };

  // Hàm refetch thông tin tổ chức cho Drawer
  const refetchUserOrganizations = async () => {
    try {
      const res = await fetchOrganizationsByAccount({
        acocuntId: userData?.id || 101,
        type: "*",
        fetchOrganizationRole: true,
      });
      const orgs = res.payload || [];
      setOrganizationTree(orgs);

      const rows = buildOrgRolesRows(orgs);
      setOrgRolesRows(rows);

      // đồng bộ selectedOrgs (để lần mở modal sau vẫn tick đúng)
      const ids = collectOrgIds(orgs);
      setSelectedOrgs(ids.map((id) => ({ id })));
    } catch (e) {
      console.error("Refetch organizations failed:", e);
    }
  };

  // Trích tất cả ID trong cây tổ chức của user
  const collectOrgIds = (nodes: any[]): number[] => {
    const ids: number[] = [];
    const walk = (arr: any[]) => {
      arr.forEach((n) => {
        ids.push(n.id);
        if (n.children && n.children.length) walk(n.children);
      });
    };
    walk(nodes);
    return ids;
  };

  const fetchAllRoles = async () => {
    try {
      setLoadingRoles(true);
      const res = await fetchRolesPaginate(1, 50, "");
      if (res?.status === "OK" && res.payload?.items) {
        setRolesList(res.payload.items);
      } else {
        setRolesList([]);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách vai trò:", err);
    } finally {
      setLoadingRoles(false);
    }
  };

  // ================== HÀM THU HỒI VAI TRÒ ================== //
  const handleRevokeRole = async (
    organizationId: number,
    roleId: number,
    roleName: string
  ) => {
    try {
      const res = await deleteOrganizationAccountRoles(organizationId, userId, [
        roleId,
      ]);

      if (res?.status === "OK") {
        showNoti("info", `Đã thu hồi vai trò "${roleName}" khỏi tổ chức.`);
        await refetchUserOrganizations(); //   reload lại danh sách
      } else {
        showNoti("error", "Không thể thu hồi vai trò. Vui lòng thử lại.");
      }
    } catch (err) {
      showNoti("warning", "Không thể kết nối máy chủ.");
    }
  };

  // Khi người dùng click "Thu hồi" => mở dialog
  const handleOpenConfirm = (
    organizationId: number,
    roleId: number,
    roleName: string
  ) => {
    setRoleToDelete({ organizationId, roleId, roleName });
    setConfirmOpen(true);
  };

  // Khi người dùng bấm "Xác nhận" trong dialog
  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;

    setLoadingDelete(true);
    try {
      await handleRevokeRole(
        roleToDelete.organizationId,
        roleToDelete.roleId,
        roleToDelete.roleName
      );
    } finally {
      setLoadingDelete(false);
      setConfirmOpen(false);
      setRoleToDelete(null);
    }
  };

  useEffect(() => {
    refetchUserOrganizations();
  }, [userData?.id]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} fz="lg" c="blue">
          Cập nhật thông tin cán bộ
        </Text>
      }
      position="right"
      size="50%"
      padding="xl"
      overlayProps={{ opacity: 0.4, blur: 4 }}
    >
      <Stack gap="xl">
        {/* -------- CARD: Thông tin tài khoản -------- */}
        <Card
          withBorder
          radius="md"
          shadow="xs"
          style={{ paddingTop: "1.8rem" }}
        >
          <Title order={5} c="blue" fw={600}>
            Thông tin tài khoản cán bộ
          </Title>
          <Grid gutter="md" mt="xs">
            <Grid.Col span={6}>
              <TextInput
                label="Tài khoản"
                withAsterisk
                value={userData.username || ""}
                onChange={(e) => onChange("username", e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Mã số cán bộ"
                value={userData.staffCode || ""}
                onChange={(e) => onChange("staffCode", e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Họ tên"
                withAsterisk
                value={userData.name || ""}
                onChange={(e) => onChange("name", e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Email"
                withAsterisk
                value={userData.email || ""}
                onChange={(e) => onChange("email", e.currentTarget.value)}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* -------- CARD: Thông tin cá nhân -------- */}
        <Card
          withBorder
          radius="md"
          shadow="xs"
          style={{ paddingTop: "1.8rem" }}
        >
          <Title order={5} c="blue" fw={600}>
            Thông tin cá nhân
          </Title>
          <Grid gutter="md" mt="xs">
            <Grid.Col span={6}>
              <Radio.Group
                label="Giới tính"
                value={String(userData.gender ?? "")}
                onChange={(v) => onChange("gender", Number(v))}
              >
                <Group mt="xs">
                  <Radio value="0" label="Nam" />
                  <Radio value="1" label="Nữ" />
                </Group>
              </Radio.Group>
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Ngày sinh"
                placeholder="dd/mm/yyyy"
                value={userData.birth || ""}
                onChange={(e) => onChange("birth", e.currentTarget.value)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Số CMND"
                value={userData.cmnd || ""}
                onChange={(e) => onChange("cmnd", e.currentTarget.value)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Số CCCD"
                value={userData.cccd || ""}
                onChange={(e) => onChange("cccd", e.currentTarget.value)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Số điện thoại"
                value={userData.phone || ""}
                onChange={(e) => onChange("phone", e.currentTarget.value)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Địa chỉ thường trú"
                value={userData.address || ""}
                onChange={(e) => onChange("address", e.currentTarget.value)}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* -------- CARD: Thông tin vai trò -------- */}
        <Card
          withBorder
          radius="md"
          shadow="xs"
          style={{ paddingTop: "1.8rem" }}
        >
          <Title order={5} c="blue" fw={600}>
            Thông tin vai trò
          </Title>

          <Table
            striped="even"
            highlightOnHover
            withColumnBorders
            mt="md"
            verticalSpacing="xs"
            horizontalSpacing="sm"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th w="5%" ta="center">
                  STT
                </Table.Th>
                <Table.Th w="30%" ta="center">
                  Tổ chức
                </Table.Th>
                <Table.Th ta="center">Các vai trò</Table.Th>
                <Table.Th w="5%" ta="center">
                  #
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {orgRolesRows.map((r, index) => (
                <Table.Tr key={r.id}>
                  <Table.Td ta="center">{index + 1}</Table.Td>

                  <Table.Td>
                    <Text fw={500}>{r.organization}</Text>
                  </Table.Td>

                  <Table.Td>
                    {r.roles.length > 0 ? (
                      <Stack gap={6}>
                        {r.roles.map((role, i) => (
                          <Group
                            key={role.id}
                            justify="space-between"
                            style={{
                              padding: "4px 0",
                              borderBottom:
                                i < r.roles.length - 1
                                  ? "1px solid #eee"
                                  : "none",
                            }}
                          >
                            <Text fz="sm">{role.name}</Text>
                            <Button
                              size="xs"
                              color="red"
                              variant="light"
                              radius="xl"
                              styles={{
                                root: { padding: "2px 8px", height: "auto" },
                              }}
                              onClick={() =>
                                handleOpenConfirm(r.id, role.id, role.name)
                              }
                            >
                              Thu hồi
                            </Button>
                          </Group>
                        ))}
                      </Stack>
                    ) : (
                      <Text c="dimmed" fz="sm" ta="center">
                        Chưa có vai trò nào
                      </Text>
                    )}
                  </Table.Td>

                  <Table.Td ta="center">
                    <Button
                      size="xs"
                      color="green"
                      leftSection={<IconPlus size={14} />}
                      variant="light"
                      radius="md"
                      onClick={async () => {
                        setCurrentOrgId(r.id);
                        // tick sẵn trong modal theo vai trò hiện có của org này
                        setSelectedRoleIdsForModal(r.roles.map((x) => x.id));
                        await fetchAllRoles(); // gọi paginate roles
                        setRoleModalOpen(true); // mở modal
                      }}
                    >
                      Thêm vai trò
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>

        {/* -------- CARD: Thông tin tổ chức -------- */}
        <Card
          withBorder
          radius="md"
          shadow="xs"
          style={{ paddingTop: "1.8rem" }}
        >
          <Group justify="space-between" align="center">
            <Title order={5} c="blue" fw={600}>
              Thông tin tổ chức
            </Title>
            <Button
              size="xs"
              leftSection={<IconPlus size={14} />}
              variant="light"
              color="blue"
              onClick={handleOpenOrgModal}
              loading={loadingOrg}
            >
              Cập nhật tổ chức
            </Button>
          </Group>

          <Stack mt="md" gap="xs">
            {organizationTree.map((org) => (
              <OrganizationNode key={org.id} node={org} />
            ))}
          </Stack>
        </Card>

        {/* -------- BUTTON -------- */}
        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button color="blue" onClick={onSave}>
            Cập nhật
          </Button>
        </Group>

        {/* Modal cập nhật tổ chức */}
        <UpdateOrganizationModal
          opened={orgModalOpen}
          onClose={() => setOrgModalOpen(false)}
          onSave={(newOrgs) => setSelectedOrgs(newOrgs)}
          organizationTree={orgsTree}
          selectedIds={selectedOrgs.map((x) => x.id)}
          accountId={userData?.id || 101}
          onSuccess={refetchUserOrganizations}
        />

        {/* Modal thêm vai trò */}
        <AddRolesModal
          opened={roleModalOpen}
          onClose={() => setRoleModalOpen(false)}
          userId={userId}
          organizationId={currentOrgId ?? 0}
          selectedRoleIds={selectedRoleIdsForModal}
          allRoles={rolesList}
          loading={loadingRoles}
          onSave={handleSaveRoles}
          onSuccess={refetchUserOrganizations}
        />

        {/* Dialog xác nhận xóa */}
        <ConfirmDialog
          opened={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Xác nhận thu hồi quyền"
          message={`Bạn có chắc chắn muốn thu hồi vai trò "${roleToDelete?.roleName}" khỏi tổ chức không?`}
          reloginLabel="Hủy"
          continueLabel="Thu hồi"
          loading={loadingDelete}
        />
      </Stack>
    </Drawer>
  );
}
