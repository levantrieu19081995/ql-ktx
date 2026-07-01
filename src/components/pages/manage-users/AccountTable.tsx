"use client";

import React, { useRef, useState } from "react";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Divider,
  Group,
  Menu,
  Popover,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import {
  IconEdit,
  IconSettings,
  IconTrash,
  IconUserMinus,
} from "@tabler/icons-react";
// import type { UserItem } from "@/types/global";
import { HoverButton } from "@/components/common/HoverButton";

interface AccountTableProps {
  rows: any[];
  page: number;
  pageSize: number;
  onEdit: (u: any) => void;
  onRowClick: (e: React.MouseEvent, u: any) => void;
  onDeleteUser: (u: any) => void;
  onDetachFromOrg: (u: any) => void;
}

export default function AccountTable({
  rows,
  page,
  pageSize,
  onEdit,
  onRowClick,
  onDeleteUser,
  onDetachFromOrg,
}: AccountTableProps) {
  const [hoveredOrgId, setHoveredOrgId] = useState<number | null>(null);
  const [hoveredRoleId, setHoveredRoleId] = useState<number | null>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const hoverRoleTimer = useRef<NodeJS.Timeout | null>(null);

  return (
    <Table striped="even" highlightOnHover withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th w="5%" />
          <Table.Th w="3%" ta="center">
            #
          </Table.Th>
          <Table.Th w="20%" ta="center">
            Thông tin cá nhân
          </Table.Th>
          <Table.Th w="25%" ta="center">
            Đơn vị
          </Table.Th>
          <Table.Th w="25%" ta="center">
            Vai trò
          </Table.Th>
          <Table.Th w="8%" ta="center">
            Trạng thái
          </Table.Th>
          <Table.Th w="12%" ta="center">
            Hành động
          </Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {rows.length > 0 ? (
          rows.map((u, i) => (
            <Table.Tr
              key={u.id}
              onClick={(e) => onRowClick(e, u)}
              style={{ cursor: "pointer" }}
            >
              {/* Avatar */}
              <Table.Td>
                <Avatar
                  src={u.avatar || undefined}
                  radius="xl"
                  color="blue"
                  alt={u.caNhan?.ten || u.username}
                >
                  {u.caNhan?.ten?.[0] || "U"}
                </Avatar>
              </Table.Td>

              {/* STT */}
              <Table.Td ta="center" w={60}>
                {(page - 1) * pageSize + i + 1}
              </Table.Td>

              {/* Thông tin cá nhân */}
              <Table.Td>
                <Stack gap={2}>
                  <Text fw={600} fz="sm" c="blue">
                    {u.caNhan?.ten || u.username}
                  </Text>
                  <Text fz="xs" c="dimmed">
                    📧 {u.email || u.caNhan?.email}
                  </Text>
                  <Text fz="xs" c="dimmed">
                    📞 {u.caNhan?.sdt || "Chưa cập nhật"}
                  </Text>
                </Stack>
              </Table.Td>

              {/* Đơn vị */}
              <Table.Td>
                {u.organizations && u.organizations.length > 0 ? (
                  (() => {
                    const uniqueOrgs = Array.from(
                      new Set(
                        u.organizations
                          .map((o: any) => o.name?.trim())
                          .filter(Boolean),
                      ),
                    );

                    return (
                      <Stack gap={2}>
                        {uniqueOrgs.slice(0, 2).map((orgName, idx) => (
                          <Text key={idx} fz="sm" c="gray.8">
                            • aaa
                          </Text>
                        ))}

                        {uniqueOrgs.length > 2 && (
                          <Popover
                            opened={hoveredOrgId === u.id}
                            onClose={() => setHoveredOrgId(null)}
                            width={260}
                            position="bottom-start"
                            withArrow
                            shadow="md"
                          >
                            <Popover.Target>
                              <Text
                                fz="xs"
                                c="blue"
                                fs="italic"
                                onMouseEnter={() => {
                                  if (hoverTimer.current)
                                    clearTimeout(hoverTimer.current);
                                  setHoveredOrgId(u.id);
                                }}
                                onMouseLeave={() => {
                                  hoverTimer.current = setTimeout(
                                    () => setHoveredOrgId(null),
                                    200,
                                  );
                                }}
                                style={{
                                  cursor: "pointer",
                                  textDecoration: "underline dotted",
                                }}
                              >
                                + {uniqueOrgs.length - 2} đơn vị khác
                              </Text>
                            </Popover.Target>

                            <Popover.Dropdown
                              onMouseEnter={() => {
                                if (hoverTimer.current)
                                  clearTimeout(hoverTimer.current);
                                setHoveredOrgId(u.id);
                              }}
                              onMouseLeave={() => {
                                hoverTimer.current = setTimeout(
                                  () => setHoveredOrgId(null),
                                  200,
                                );
                              }}
                              style={{
                                backgroundColor: "white",
                                border: "1px solid #dbeafe",
                                maxHeight: 300,
                                overflowY: "auto",
                                color: "#1a56db",
                                borderRadius: 8,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                padding: "6px 10px",
                                zIndex: 1000,
                              }}
                            >
                              <Stack gap={2}>
                                {uniqueOrgs.slice(2).map((orgName, i) => (
                                  <Text key={i} fz="xs" fw={500}>
                                    • aaaa
                                  </Text>
                                ))}
                              </Stack>
                            </Popover.Dropdown>
                          </Popover>
                        )}
                      </Stack>
                    );
                  })()
                ) : (
                  <Text fz="xs" c="dimmed" fs="italic">
                    Chưa thuộc đơn vị nào
                  </Text>
                )}
              </Table.Td>

              {/* Vai trò */}
              <Table.Td>
                {u.organizations &&
                u.organizations.some((o: any) => o.roles?.length) ? (
                  (() => {
                    const allRoles = u.organizations.flatMap((o: any) =>
                      (o.roles || []).map((r: any) => ({
                        roleName: r.roleName?.trim(),
                        orgName: o.name?.trim() || "",
                      })),
                    );

                    const uniqueRoles = allRoles.filter(
                      (v: any, i: any, a: any) =>
                        i ===
                        a.findIndex(
                          (t: any) =>
                            t.roleName === v.roleName &&
                            t.orgName === v.orgName,
                        ),
                    );

                    return (
                      <Stack gap={2}>
                        {uniqueRoles.slice(0, 2).map((item: any, idx: any) => (
                          <Text key={idx} fz="sm" c="gray.8">
                            • {item.roleName} –{" "}
                            <Text span c="dimmed" fz="sm" fw={400}>
                              {item.orgName}
                            </Text>
                          </Text>
                        ))}

                        {uniqueRoles.length > 2 && (
                          <Popover
                            opened={hoveredRoleId === u.id}
                            onClose={() => setHoveredRoleId(null)}
                            width={400}
                            position="bottom-start"
                            withArrow
                            shadow="md"
                            transitionProps={{
                              transition: "pop",
                              duration: 120,
                            }}
                          >
                            <Popover.Target>
                              <Text
                                fz="xs"
                                c="blue"
                                fs="italic"
                                onMouseEnter={() => {
                                  if (hoverRoleTimer.current)
                                    clearTimeout(hoverRoleTimer.current);
                                  setHoveredRoleId(u.id);
                                }}
                                onMouseLeave={() => {
                                  hoverRoleTimer.current = setTimeout(
                                    () => setHoveredRoleId(null),
                                    200,
                                  );
                                }}
                                style={{
                                  cursor: "pointer",
                                  textDecoration: "underline dotted",
                                }}
                              >
                                + {uniqueRoles.length - 2} vai trò khác
                              </Text>
                            </Popover.Target>

                            <Popover.Dropdown
                              onMouseEnter={() => {
                                if (hoverRoleTimer.current)
                                  clearTimeout(hoverRoleTimer.current);
                                setHoveredRoleId(u.id);
                              }}
                              onMouseLeave={() => {
                                hoverRoleTimer.current = setTimeout(
                                  () => setHoveredRoleId(null),
                                  200,
                                );
                              }}
                              style={{
                                backgroundColor: "white",
                                border: "1px solid #dbeafe",
                                maxHeight: 400,
                                overflowY: "auto",
                                color: "#1a56db",
                                borderRadius: 8,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                padding: "6px 10px",
                                zIndex: 1000,
                              }}
                            >
                              <Stack gap={2}>
                                {uniqueRoles
                                  .slice(2)
                                  .map((item: any, i: any) => (
                                    <Text key={i} fz="xs" fw={500}>
                                      • {item.roleName} –{" "}
                                      <Text span fw={400}>
                                        {item.orgName}
                                      </Text>
                                    </Text>
                                  ))}
                              </Stack>
                            </Popover.Dropdown>
                          </Popover>
                        )}
                      </Stack>
                    );
                  })()
                ) : (
                  <Text fz="xs" c="dimmed" fs="italic">
                    Chưa được phân vai trò
                  </Text>
                )}
              </Table.Td>

              {/* Trạng thái */}
              <Table.Td ta="center">
                <Badge
                  color={u.status === 1 ? "green" : "gray"}
                  variant="light"
                  size="sm"
                >
                  {u.status === 1 ? "Hoạt động" : "Ngưng hoạt động"}
                </Badge>
              </Table.Td>

              {/* Hành động */}
              <Table.Td ta="center">
                <Group
                  justify="center"
                  gap="sm"
                  wrap="wrap"
                  data-stop-propagation
                >
                  <HoverButton
                    color="blue"
                    icon={<IconEdit size={16} />}
                    label="Cập nhật"
                    onClick={() => onEdit(u)}
                  />

                  <HoverButton
                    color="orange"
                    icon={<IconUserMinus size={16} />}
                    label="Xóa khỏi đơn vị"
                    onClick={() => onDetachFromOrg(u)}
                  />

                  <HoverButton
                    color="red"
                    icon={<IconTrash size={16} />}
                    label="Xóa tài khoản"
                    onClick={() => onDeleteUser(u)}
                  />
                </Group>
              </Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td colSpan={7}>
              <Text c="dimmed" ta="center">
                Không có bản ghi phù hợp.
              </Text>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}
