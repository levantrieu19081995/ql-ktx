"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Card,
  Group,
  Modal,
  Skeleton,
  Stack,
  Text,
  Title,
  ScrollArea,
  Divider,
  Box,
} from "@mantine/core";
import { IconUser } from "@tabler/icons-react";

// TODO: thay thế bằng service thực tế của bạn
import { getAccountDetailByGuid } from "@/services/account/accountService";
// import { AccountDetailResponse } from "@/types/global";

type Props = {
  opened: boolean;
  onClose: () => void;
  accountGuid: string | null;
  rolesData?: { org: string; role: string }[];
};

export default function AccountDetailModal({
  opened,
  onClose,
  accountGuid,
  rolesData,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any["payload"] | null>(null);

  const [error, setError] = useState<string | null>(null);

  // gọi API mỗi khi mở modal & có guid
  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!opened || !accountGuid) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getAccountDetailByGuid(accountGuid);
        if (!mounted) return;
        // giả sử res.payload là dữ liệu chi tiết
        setDetail(res?.payload ?? null);
      } catch (e: any) {
        if (!mounted) return;
        setError("Không tải được chi tiết người dùng.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [opened, accountGuid]);

  const rolesFlat = useMemo(() => {
    if (!detail?.organizations) return [];
    return detail.organizations.flatMap((o: any) =>
      (o.roles ?? []).map((r: any) => ({ org: o.name, role: r.roleName })),
    );
  }, [detail]);

  const isActive = detail?.status === 1;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      radius="md"
      size="xl"
      withCloseButton
      title={
        <Box>
          <Title order={4} c={"blue"} component="div">
            Thông tin người dùng
          </Title>
        </Box>
      }
      overlayProps={{ blur: 6, opacity: 0.25 }}
      styles={{
        content: {
          // nền kính mờ
          background: "rgba(255, 255, 255, 0.34)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.64)",
        },
        header: { borderBottom: "none" },
        body: { paddingTop: 0 },
      }}
    >
      <ScrollArea.Autosize
        mah="70vh"
        type="hover"
        scrollbarSize={8}
        offsetScrollbars
        styles={{
          scrollbar: {
            transition: "opacity 0.2s ease",
            opacity: 0,
          },
          viewport: {
            "&:hover ~ div[data-scrollbar]": {
              opacity: 1,
            },
          },
        }}
      >
        <Stack gap="lg">
          {/* Cụm thông tin người dùng */}
          <Card withBorder radius="md" shadow="xs" bg="white" mt={20}>
            {loading ? (
              <Group wrap="nowrap" align="center" gap="md">
                <Skeleton height={64} circle />
                <Stack gap={6} w="100%">
                  <Skeleton height={14} width="40%" />
                  <Skeleton height={12} width="60%" />
                  <Skeleton height={12} width="35%" />
                </Stack>
              </Group>
            ) : (
              <>
                <Group justify="space-between" align="center" mb="sm">
                  <Group>
                    <Avatar
                      src={detail?.avatar ?? undefined}
                      size={64}
                      radius="xl"
                      color="blue"
                    >
                      <IconUser size={28} />
                    </Avatar>
                    <Stack gap={2}>
                      <Text fw={700} fz="lg">
                        {detail?.caNhan?.ten || detail?.username}
                      </Text>
                      <Text c="dimmed" fz="sm">
                        📧 {detail?.email || detail?.caNhan?.email || "—"}
                      </Text>
                      <Text c="dimmed" fz="sm">
                        📞 {detail?.caNhan?.sdt || "—"}
                      </Text>
                    </Stack>
                  </Group>
                  {detail && (
                    <Badge
                      size="sm"
                      variant="light"
                      color={detail?.status === 1 ? "green" : "gray"}
                    >
                      {detail?.status === 1 ? "HOẠT ĐỘNG" : "NGƯNG"}
                    </Badge>
                  )}
                </Group>

                <Divider my="xs" />

                {/* Thông tin cá nhân mở rộng */}
                <Stack gap={6} w="100%">
                  {[
                    {
                      label: "Giới tính:",
                      value:
                        detail?.caNhan?.gioiTinh === 0
                          ? "Nam"
                          : detail?.caNhan?.gioiTinh === 1
                            ? "Nữ"
                            : "—",
                    },
                    {
                      label: "Ngày sinh:",
                      value: detail?.caNhan?.ngaySinh
                        ? new Date(detail.caNhan.ngaySinh).toLocaleDateString(
                            "vi-VN",
                          )
                        : "—",
                    },
                    { label: "CMND:", value: detail?.caNhan?.cmnd || "—" },
                    { label: "CCCD:", value: detail?.caNhan?.cccd || "—" },
                    {
                      label: "Địa chỉ:",
                      value:
                        detail?.caNhan?.diaChiChiTiet ||
                        detail?.caNhan?.diaChi ||
                        "—",
                    },
                  ].map((item, idx) => (
                    <Group
                      key={idx}
                      justify="space-between"
                      style={{ width: "100%" }}
                      align="center"
                    >
                      <Text c="gray.7" fz="sm">
                        {item.label}
                      </Text>
                      <Text
                        fw={600}
                        c="gray.9"
                        fz="sm"
                        style={{ textAlign: "right" }}
                      >
                        {item.value}
                      </Text>
                    </Group>
                  ))}
                </Stack>

                {error && (
                  <>
                    <Divider my="sm" />
                    <Text c="red" fz="sm">
                      {error}
                    </Text>
                  </>
                )}
              </>
            )}
          </Card>

          {/* Cụm thông tin vai trò */}
          <Card withBorder radius="md" shadow="xs" bg="white">
            <Title order={6} mb="xs">
              Vai trò
            </Title>
            {loading ? (
              <Stack gap={6}>
                <Skeleton height={12} />
                <Skeleton height={12} />
                <Skeleton height={12} width="70%" />
              </Stack>
            ) : rolesData && rolesData.length ? (
              <Stack gap={6} w="100%">
                {rolesData.map((r, idx) => (
                  <Group
                    key={idx}
                    justify="space-between"
                    style={{ width: "100%" }}
                    align="center"
                  >
                    <Text c="gray.7" fz="sm">
                      {r.role}:
                    </Text>
                    <Text
                      fw={600}
                      c="gray.9"
                      fz="sm"
                      style={{ textAlign: "right" }}
                    >
                      {r.org}
                    </Text>
                  </Group>
                ))}
              </Stack>
            ) : (
              <Text fz="sm" c="dimmed" fs="italic">
                Chưa được phân vai trò
              </Text>
            )}
          </Card>

          {/* Cụm thông tin đơn vị */}
          <Card withBorder radius="md" shadow="xs" bg="white">
            <Title order={6} mb="xs">
              Đơn vị
            </Title>
            {loading ? (
              <Stack gap={6}>
                <Skeleton height={12} width="40%" />
                <Skeleton height={12} width="55%" />
                <Skeleton height={12} width="35%" />
              </Stack>
            ) : detail?.organizations?.length ? (
              <Stack gap={6}>
                {detail.organizations.map((o: any, i: any) => (
                  <Text key={i} fz="sm">
                    • {o.name}
                  </Text>
                ))}
              </Stack>
            ) : (
              <Text fz="sm" c="dimmed" fs="italic">
                Chưa thuộc đơn vị nào
              </Text>
            )}
          </Card>
        </Stack>
      </ScrollArea.Autosize>
    </Modal>
  );
}
