/* eslint-disable react-hooks/exhaustive-deps */
"use client";
// src\components\shell\AppSidebar.tsx
// import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { filterMenuByPermission } from "@/utils/menuPermission";
import {
  NavLink,
  Stack,
  Modal,
  Group,
  Button,
  Text,
  Box,
  Tooltip,
  ActionIcon,
  Title,
  Card,
  Table,
} from "@mantine/core";
import {
  IconId,
  IconHome2,
  IconLogout,
  IconChevronLeft,
  IconChevronDown,
  IconChevronRight,
  IconUser,
  IconBooks,
  IconBook2,
  IconCar,
  IconCategory,
  IconNote,
  IconChartBar,
  IconArrowsLeftRight,
  IconUserX,
  IconEyeExclamation,
  IconLockFilled,
  IconHistory,
  IconAlertTriangle,
  IconSettings,
  IconUsersGroup,
  IconShieldLock,
  IconLayoutSidebarLeftExpand,
  IconLayoutSidebarLeftCollapse,
} from "@tabler/icons-react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, Link, useRouter } from "@/i18n/navigation";
import { signOut } from "next-auth/react";
import { useMediaQuery } from "@mantine/hooks";
import usePermissions from "@/hooks/usePermissions";
import logo from "@/assets/images/CTU_logo.png";

type Props = {
  onNavigate?: () => void;
  collapsed?: boolean;
  toggle?: () => void;
};

// Dữ liệu về các tính năng mới và đã có của phiên bản

export default function AppSidebar({ onNavigate, collapsed, toggle }: Props) {
  const { permissions, loading } = usePermissions();

  const t = useTranslations("Menu");
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [versionInfoOpen, setVersionInfoOpen] = useState(false);

  const [appInfo, setAppInfo] = useState({ appVersion: "", buildDate: "" });
  const [versions, setVersions] = useState([]);
  const [listOfAppFunctions, setListOfAppFunctions] = useState<any>([]);

  // === State điều khiển mở rộng các menu cha ===
  const [openParents, setOpenParents] = useState<string[]>([t("category")]);
  const openDocA = () => {
    window.open("/doc/huong_dan1.pdf", "_blank");
  };
  const openDocB = () => {
    window.open("/doc/huong_dan2.pdf", "_blank");
  };

  // === Danh sách menu ===
  const items = [
    { icon: <IconHome2 />, label: t("home"), href: "/dashboard" },

    // === Lịch sử/Cảnh báo
    {
      icon: <IconHistory />,
      label: t("historyWarning"),
      grouped: true,
      children: [
        {
          label: t("historyMenu"),
          href: "/history",
          icon: <IconHistory size={16} />,
        },
        {
          label: t("warningsMenu"),
          href: "/warnings",
          icon: <IconAlertTriangle size={16} />,
        },
        {
          label: t("tollManagement"),
          href: "/toll-management",
          icon: <IconCar size={16} />,
        },
      ],
    },

    // === Danh mục ===
    {
      icon: <IconCategory />,
      label: t("category"),
      grouped: true,
      children: [
        {
          label: t("categoryStudentDorm"),
          href: "/danh-muc/sinh-vien-ktx",
          icon: <IconUser size={16} />,
        },
        {
          label: t("categoryRoomDorm"),
          href: "/danh-muc/phong-ktx",
          icon: <IconHome2 size={16} />,
        },
        {
          label: t("categoryAreaDorm"),
          href: "/danh-muc/khu-ktx",
          icon: <IconCategory size={16} />,
        },
        {
          label: t("categoryBannedStudent"),
          href: "/danh-muc/sinh-vien-bi-cam",
          icon: <IconLockFilled size={16} />,
        },
      ],
    },

    // === Thống kê ===
    {
      icon: <IconChartBar />,
      label: t("statistics"),
      grouped: true,
      children: [
        {
          label: t("statInOut"),
          href: "/thong-ke/luot-ra-vao",
          icon: <IconArrowsLeftRight size={16} />,
        },
        {
          label: t("statByCode"),
          href: "/thong-ke/theo-ma-so",
          icon: <IconId size={16} />,
        },
        {
          label: t("statAbsent"),
          href: "/thong-ke/vang-mat",
          icon: <IconUserX size={16} />,
        },
        {
          label: t("statStranger"),
          href: "/thong-ke/nguoi-la",
          icon: <IconEyeExclamation size={16} />,
        },
        {
          label: t("statBanned"),
          href: "/thong-ke/bi-cam",
          icon: <IconLockFilled size={16} />,
        },
      ],
    },

    // === Cài đặt ===
    {
      icon: <IconSettings />,
      label: t("settings"),
      grouped: true,
      children: [
        {
          label: t("settings"),
          href: "/settings",
          icon: <IconSettings size={16} />,
        },
        {
          label: t("manage-users"),
          href: "/manage-users",
          icon: <IconUsersGroup size={16} />,
        },
        {
          label: t("manage-roles"),
          href: "/manage-roles",
          icon: <IconShieldLock size={16} />,
        },
      ],
    },

    // === Hướng dẫn ===
    {
      icon: <IconBooks />,
      label: t("instructionManual"),
      grouped: true,
      children: [
        {
          label: t("DocumentVehicleinspection"),
          icon: <IconBook2 size={16} />,
          onClick: () => openDocA(),
        },
        {
          label: t("DocumentExtraFees"),
          icon: <IconNote size={16} />,
          onClick: () => openDocB(),
        },
      ],
    },
  ];

  const doLogout = () => {
    setConfirmOpen(false);
    signOut({ callbackUrl: `/${locale}/login` }).catch(() => {
      try {
        document.cookie = "next-auth.session-token=; Max-Age=0; Path=/";
        document.cookie =
          "__Secure-next-auth.session-token=; Max-Age=0; Path=/; SameSite=Lax";
      } finally {
        router.replace(`/${locale}/login`);
      }
    });
    onNavigate?.();
  };

  const navLinkStyles = (active: boolean, compact = false) => ({
    root: {
      // minHeight: compact ? 44 : 48,
      // borderRadius: 12,
      // padding: compact ? 0 : "0 14px 0 12px",
      minHeight: compact ? 44 : 48,
      borderRadius: 12,
      padding: compact ? 0 : "0 14px 0 12px",

      //
      background: active ? "rgba(37, 99, 235, 0.08)" : "transparent",
      // borderLeft: active ? "3px solid #2563EB" : "3px solid transparent",
      fontWeight: active ? 800 : 650,
      transition: "background-color 150ms ease, color 150ms ease",
    },
    label: {
      fontSize: compact ? 0 : 14,
      lineHeight: 1.2,
    },
    section: {
      color: active ? "#2563EB" : "#0f172a",
      marginRight: compact ? 0 : 12,
    },
  });

  const toggleParent = (item: any, isActive: boolean) => {
    const label = item.label;

    setOpenParents((prev) => {
      const isCurrentlyOpen = prev.includes(label);

      // Đang active thì không cho đóng
      if (isActive && isCurrentlyOpen) {
        return prev;
      }

      // Nếu đang mở mà không active thì cho đóng
      if (isCurrentlyOpen) {
        return prev.filter((x) => x !== label);
      }

      // Nếu mở menu mới:
      // Giữ lại menu nào đang chứa item active
      const activeParent = items.find((parent) =>
        parent.children?.some((child: any) => pathname.startsWith(child.href)),
      );

      const keepActiveLabel = activeParent?.label;

      const next = prev.filter((x) => x === keepActiveLabel);

      return [...new Set([...next, label])];
    });
  };

  // === Render menu item (hỗ trợ cấp con) ===
  const renderNavItem = (item: any, index: number) => {
    const hasChildren = !!item.children;

    const isActive = hasChildren
      ? item.children.some((child: any) => pathname.startsWith(child.href))
      : pathname.startsWith(item.href ?? "");
    const isOpen = openParents.includes(item.label);

    if (collapsed) {
      // === Dạng mở rộng đầy đủ ===
      // ================= COLLAPSED MODE =================
      if (collapsed) {
        return (
          <Box key={item.label} style={{ width: "100%" }}>
            <Tooltip
              label={item.label}
              position="right"
              withArrow
              withinPortal
              openDelay={200}
              transitionProps={{ transition: "fade", duration: 150 }}
            >
              <Box
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <NavLink
                  leftSection={item.icon}
                  component={item.onClick ? "button" : (Link as any)}
                  href={item.href}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                      return;
                    }

                    if (hasChildren) {
                      toggleParent(item, isActive);
                      return;
                    }

                    if (isMobile) {
                      onNavigate?.();
                    }
                  }}
                  active={isActive}
                  styles={{
                    root: {
                      width: 44,
                      height: 44,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 8,
                      padding: 0,
                      margin: "4px auto",
                      flexDirection: "row",
                    },
                    section: {
                      marginRight: 0,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      height: "100%",
                    },
                    label: {
                      display: "none",
                    },
                  }}
                />
              </Box>
            </Tooltip>
          </Box>
        );
      }
    }

    // === Dạng mở rộng đầy đủ ===
    return (
      <Box key={item.label}>
        {hasChildren && item.grouped ? (
          <Box>
            <Group
              justify="space-between"
              px={12}
              mb={8}
              mt={14}
              style={{ cursor: "pointer" }}
              // onClick={() => setOpenParent(isOpen ? null : item.label)}
              onClick={() => toggleParent(item, isActive)}
            >
              <Text
                tt="uppercase"
                fz={12}
                fw={700}
                c="#7b8798"
                style={{ letterSpacing: 0 }}
              >
                {item.label}
              </Text>
              {isOpen ? (
                <IconChevronDown size={15} color="#64748b" />
              ) : (
                <IconChevronRight size={15} color="#64748b" />
              )}
            </Group>
          </Box>
        ) : hasChildren ? (
          //  MENU CHA
          <NavLink
            label={item.label}
            leftSection={item.icon}
            rightSection={
              isOpen ? (
                <IconChevronDown size={16} />
              ) : (
                <IconChevronRight size={16} />
              )
            }
            component="button"
            // onClick={() => setOpenParent(isOpen ? null : item.label)}
            onClick={() => toggleParent(item, isActive)}
            active={isActive}
            // styles={navLinkStyles(isActive, false)}
            styles={{
              ...navLinkStyles(isActive, false),
              root: {
                ...navLinkStyles(isActive, false).root,
                paddingRight: index === 0 ? 56 : 14,
              },
            }}
          />
        ) : item.onClick ? (
          // MENU SYSTEM (VERSION)
          <NavLink
            component="button"
            label={item.label}
            leftSection={item.icon}
            onClick={item.onClick} //   QUAN TRỌNG
          />
        ) : (
          //  MENU ĐIỀU HƯỚNG
          <NavLink
            component={Link as any}
            href={item.href}
            label={item.label}
            leftSection={item.icon}
            active={isActive}
            onClick={isMobile ? onNavigate : undefined}
            styles={{
              ...navLinkStyles(isActive, false),
              root: {
                ...navLinkStyles(isActive, false).root,
                paddingRight: index === 0 ? 56 : 14,
              },
            }}
          />
        )}

        {/* Hiển thị submenu */}
        {hasChildren && isOpen && (
          <Stack pl={item.grouped ? 0 : 36} gap={4} mt={item.grouped ? 0 : 4}>
            {item.children.map((child: any, index: number) =>
              child.onClick ? (
                <NavLink
                  key={child.label ?? index}
                  component="button"
                  label={child.label}
                  leftSection={child.icon}
                  onClick={child.onClick}
                  styles={navLinkStyles(false, false)}
                  style={{ fontSize: "14px", paddingTop: 6, paddingBottom: 6 }}
                />
              ) : (
                <NavLink
                  key={child.href ?? index}
                  component={Link as any}
                  href={child.href}
                  label={child.label}
                  leftSection={child.icon}
                  active={pathname.startsWith(child.href)}
                  onClick={isMobile ? onNavigate : undefined}
                  styles={navLinkStyles(pathname.startsWith(child.href), false)}
                  style={{
                    fontSize: "14px",
                    paddingTop: 6,
                    paddingBottom: 6,
                  }}
                />
              ),
            )}
          </Stack>
        )}
      </Box>
    );
  };

  // == bắt item menu theo quyền

  const filteredItems = filterMenuByPermission(items, permissions);

  useEffect(() => {
    fetch("/version/versions.json")
      .then((res) => res.json())
      .then((data) => {
        setAppInfo(data.appInfo);
        setVersions(data.versions);
        setListOfAppFunctions(data.ListOfAppFunctions);
      })
      .catch((err) => console.log("Load version json error", err));
  }, []);

  useEffect(() => {
    const activeParent = items.find((item) =>
      item.children?.some((child: any) => pathname.startsWith(child.href)),
    );

    if (activeParent) {
      setOpenParents((prev) =>
        prev.includes(activeParent.label)
          ? prev
          : [...prev, activeParent.label],
      );
    }
  }, [pathname]);

  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [showCurrentFeatures, setShowCurrentFeatures] = useState(false);

  let modalTitle = "Danh sách phiên bản (10/02/2026)";

  if (selectedVersion) {
    modalTitle = `Chi tiết phiên bản: ${selectedVersion.version}`;
  }

  if (showCurrentFeatures) {
    modalTitle = "Danh sách chức năng hệ thống";
  }

  const sidebarRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <div
        ref={sidebarRef}
        style={{
          position: "relative",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          paddingBottom: 16,
        }}
      >
        {/* <ActionIcon
          variant="default"
          size={34}
          radius="xl"
          onClick={toggle}
          aria-label="Toggle sidebar"
          style={{
            position: "absolute",
            top: 18,
            right: 12,
            zIndex: 5,
            borderColor: "#dfe6f2",
            color: "#2563EB",
            background: "#ffffff",
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
          }}
        >
          {collapsed ? (
            <IconChevronRight size={18} />
          ) : (
            <IconChevronLeft size={18} />
          )}
        </ActionIcon> */}

        <ActionIcon
          variant="subtle"
          radius="xl"
          size={34}
          onClick={toggle}
          style={{
            position: "absolute",
            top: collapsed ? 16 : 29,
            right: collapsed ? "50%" : 28,
            transform: collapsed ? "translateX(50%)" : "none",
            background: "#ffffff",
            border: "1px solid #e5eaf3",
            boxShadow: "0 8px 20px rgba(15,23,42,.08)",
            color: "#2563EB",
            zIndex: 20,
          }}
        >
          {collapsed ? (
            <IconLayoutSidebarLeftExpand size={18} stroke={1.8} />
          ) : (
            <IconLayoutSidebarLeftCollapse size={18} stroke={1.8} />
          )}
        </ActionIcon>

        {/* MENU */}
        <div
          className="sidebar-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            // padding: collapsed ? "72px 10px 40px" : "72px 24px 40px",
            padding: collapsed ? "72px 10px 40px" : "22px 24px 40px",
          }}
        >
          <Stack gap={collapsed ? 8 : 10}>
            {/* {filteredItems.map((it) => renderNavItem(it))} */}
            {filteredItems.map((it, index) => renderNavItem(it, index))}
          </Stack>
        </div>
        <Box
          style={{
            flexShrink: 0,
            padding: collapsed ? "16px 10px 4px" : "16px 26px 4px",
            borderTop: "1px solid #edf1f7",
          }}
        >
          <NavLink
            leftSection={<IconLogout />}
            label={t("logout", { default: "Đăng xuất" })}
            onClick={() => setConfirmOpen(true)}
            styles={navLinkStyles(false, collapsed)}
          />
        </Box>
      </div>

      {/* Modal xác nhận đăng xuất */}
      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t("logoutConfirmTitle", { default: "Xác nhận đăng xuất" })}
        centered
        radius="md"
      >
        <Text c="dimmed" mb="md">
          {t("logoutConfirmDesc", {
            default: "Bạn có chắc muốn đăng xuất khỏi tài khoản này?",
          })}
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setConfirmOpen(false)}>
            {t("cancel", { default: "Huỷ" })}
          </Button>
          <Button color="red" onClick={doLogout}>
            {t("logout", { default: "Đăng xuất" })}
          </Button>
        </Group>
      </Modal>
      {/* Modal chứa thông tin phiên bản */}
      <Modal
        opened={versionInfoOpen}
        onClose={() => {
          setVersionInfoOpen(false);
          setSelectedVersion(null);
          setShowCurrentFeatures(false);
        }}
        title={
          <Box>
            <Title order={3} c={"blue"}>
              {modalTitle}
            </Title>
          </Box>
        }
        centered
        radius="md"
        size="50%"
      >
        {/* ===== 1) LIST VERSION ===== */}
        {!selectedVersion && !showCurrentFeatures && (
          <Box>
            <Group justify="flex-end" mt="md" mb={10}>
              <Button
                variant="light"
                onClick={() => setShowCurrentFeatures(true)}
              >
                Chức năng chính của hệ thống
              </Button>
            </Group>
            <Card withBorder radius="md" p="md">
              <Table highlightOnHover striped="even" withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 80, textAlign: "center" }}>
                      STT
                    </Table.Th>
                    <Table.Th style={{ width: 150, textAlign: "center" }}>
                      Ngày Update
                    </Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>
                      Tên phiên bản
                    </Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>Ghi chú</Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {versions.map((ver: any) => (
                    <Table.Tr
                      key={ver.id}
                      onClick={() => setSelectedVersion(ver)}
                      style={{ cursor: "pointer", textAlign: "center" }}
                    >
                      <Table.Td
                        style={{ cursor: "pointer", textAlign: "center" }}
                      >
                        {ver.id}
                      </Table.Td>
                      <Table.Td
                        style={{ cursor: "pointer", textAlign: "center" }}
                      >
                        {ver.date}
                      </Table.Td>
                      <Table.Td
                        style={{ cursor: "pointer", textAlign: "center" }}
                      >
                        {ver.version}
                      </Table.Td>
                      <Table.Td
                        style={{ cursor: "pointer", textAlign: "left" }}
                      >
                        {ver.note}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          </Box>
        )}

        {/* ===== 2) CHI TIẾT VERSION ===== */}
        {selectedVersion && (
          <Card withBorder radius="md" p="md">
            <Title order={4}>Phiên bản: {selectedVersion.version}</Title>
            <Text fw={500}>Ngày cập nhật: {selectedVersion.date}</Text>

            <Text fz="lg" fw={600} mt="md" color="green">
              Chức năng mới
            </Text>

            {selectedVersion.newFeatures?.map((nf: any, idx: any) => (
              <Text key={idx}>• {nf}</Text>
            ))}

            <Group justify="flex-end" mt="lg">
              <Button onClick={() => setSelectedVersion(null)}>
                ← Quay lại
              </Button>
            </Group>
          </Card>
        )}

        {/* ===== 3) CHỨC NĂNG HIỆN TẠI ===== */}
        {showCurrentFeatures && (
          <Card withBorder radius="md" p="md">
            {listOfAppFunctions?.map((f: any, idx: number) => (
              <Text key={idx}>• {f}</Text>
            ))}

            <Group justify="flex-end" mt="lg">
              <Button onClick={() => setShowCurrentFeatures(false)}>
                ← Quay lại
              </Button>
            </Group>
          </Card>
        )}
      </Modal>
    </>
  );
}
