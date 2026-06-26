"use client";
// src\components\shell\AppSidebar.tsx
import { useEffect, useRef, useState } from "react";
import {
  NavLink,
  ScrollArea,
  Stack,
  Modal,
  Group,
  Button,
  Text,
  Box,
  Tooltip,
  ActionIcon,
  Title,
  Flex,
  Card,
  Table,
} from "@mantine/core";
import {
  IconHome2,
  IconSettings,
  IconLogout,
  IconFileInvoice,
  IconMenu2,
  IconChevronLeft,
  IconCar,
  IconUsersGroup,
  IconCoins,
  IconChevronDown,
  IconChevronRight,
  IconUser,
  IconShield,
  IconBooks,
  IconBook2,
  IconCategory,
  IconNote,
  IconShip,
  IconMotorbike,
  IconTestPipeOff,
  IconShieldPlus,
  IconTag,
  IconCash,
  IconBulldozer,
  IconTractor,
  IconCrane,
  IconForklift,
  IconTruckDelivery,
  IconTruckLoading,
  IconBus,
  IconCraneOff,
  IconHistory,
  IconAlertTriangle,
  IconChartBar,
  IconUserMinus,
} from "@tabler/icons-react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, Link, useRouter } from "@/i18n/navigation";
import { signOut } from "next-auth/react";
import { useMediaQuery } from "@mantine/hooks";
import usePermissions from "@/hooks/usePermissions";

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
  const [openParent, setOpenParent] = useState<string | null>(null);
  const openDocA = () => {
    window.open("/doc/huong_dan1.pdf", "_blank");
  };
  const openDocB = () => {
    window.open("/doc/huong_dan2.pdf", "_blank");
  };

  // === Danh sách menu ===
  const items = [
    { icon: <IconHome2 />, label: t("home"), href: "/dashboard" },
    {
      icon: <IconHistory />,
      label: t("historyMenu"),
      children: [
        {
          label: t("history-log"),
          href: "/history/log",
          icon: <IconHistory size={16} />,
        },
        {
          label: t("history-statistics"),
          href: "/history/statistics",
          icon: <IconChartBar size={16} />,
        },
        {
          label: t("history-staff"),
          href: "/history/staff",
          icon: <IconUser size={16} className="text-blue-500" />,
        },
        {
          label: t("history-student"),
          href: "/history/student",
          icon: <IconUserMinus size={16} className="text-emerald-500" />,
        },
      ],
    },
    { icon: <IconAlertTriangle />, label: t("warningsMenu"), href: "/warnings" },
    { icon: <IconCar />, label: t("tollManagement"), href: "/toll-management" },

    {
      icon: <IconShip />,
      label: t("inlandWaterwaysFeesManagement"),
      href: "/inland-waterways-fees-managenment",
    },
    {
      icon: <IconTestPipeOff />,
      label: t("inspectionFeesManagement"),
      href: "/inspection-fees-managenment",
    },
    {
      icon: <IconShieldPlus />,
      label: t("certificateOfRenovationFeesManagenment"),
      href: "/certificate-of-renovation-fees-managenment",
    },
    {
      icon: <IconTractor />,
      label: t("specializedMotorbikeFeesManagement"),
      href: "/specialized-motorbike-fees-managenment",
    },
    {
      icon: <IconCoins />,
      label: t("extraFeesManagement"),
      href: "/extra-fees-management",
    },
    {
      icon: <IconFileInvoice />,
      label: t("billManagement"),
      href: "/bill-management",
    },
    {
      icon: <IconCash />,
      label: t("feesmanagement"),
      href: "/fees-management",
    },
    {
      icon: <IconCategory />,
      label: t("category"),
      href: "/category-management",
    },

    // === menu có cấp con ===
    {
      icon: <IconUsersGroup />,
      label: t("users-roles"),
      children: [
        {
          label: t("manage-users"),
          href: "/manage-users",
          icon: <IconUser size={16} />,
        },
        {
          label: t("manage-roles"),
          href: "/manage-roles",
          icon: <IconShield size={16} />,
        },
      ],
    },

    {
      icon: <IconBooks />,
      label: t("instructionManual"),
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

    { icon: <IconSettings />, label: t("settings"), href: "/settings" },

    {
      icon: <IconTag />,
      label: `Phiên bản ${appInfo.appVersion}`,
      onClick: () => setVersionInfoOpen(true),
    },
  ];

  // Automatically open the parent menu if a child is active
  useEffect(() => {
    const currentParent = items.find((item) =>
      item.children?.some((child: any) => pathname.startsWith(child.href))
    );
    if (currentParent && openParent !== currentParent.label) {
      setOpenParent(currentParent.label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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

  // === Render menu item (hỗ trợ cấp con) ===
  const renderNavItem = (item: any) => {
    const hasChildren = !!item.children;

    const isActive = hasChildren
      ? item.children.some((child: any) => pathname.startsWith(child.href))
      : pathname.startsWith(item.href ?? "");
    const isOpen = openParent === item.label;

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
                      item.onClick(); //   Version popup
                    } else if (hasChildren) {
                      setOpenParent(isOpen ? null : item.label);
                    } else if (isMobile) {
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
        {hasChildren ? (
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
            onClick={() => setOpenParent(isOpen ? null : item.label)}
            active={isActive}
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
          />
        )}

        {/* Hiển thị submenu */}
        {hasChildren && isOpen && (
          <Stack pl={36} gap={4} mt={4}>
            {item.children.map((child: any, index: number) =>
              child.onClick ? (
                <NavLink
                  key={child.label ?? index}
                  component="button"
                  label={child.label}
                  leftSection={child.icon}
                  onClick={child.onClick}
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
  const canView = (href: string, item?: any) => {
    // if (item?.onClick) return true;
    // menu chỉ có onClick (Version, Help, About...)
    if (item?.onClick && !href) return true;

    if (!href) return false;
    const alwaysVisible = ["/dashboard", "/history", "/warnings"];
    if (alwaysVisible.some((v) => href === v || href.startsWith(v + "/"))) return true;

    const found = permissions.find((p: any) => {
      const slug = (p.dmcnSlug || "").toLowerCase().trim();
      return slug === href.toLowerCase().trim();
    });

    return !!(
      found &&
      found.listPermission?.some(
        (perm: any) => perm.psName === "VIEW" && perm.allowed,
      )
    );
  };

  const filteredItems = items
    .map((item) => {
      if (item.children) {
        const allowedChildren = item.children.filter((c: any) =>
          canView(c.href, c),
        );
        return allowedChildren.length > 0
          ? { ...item, children: allowedChildren }
          : null;
      }
      // return canView(item.href) ? item : null;
      return canView(item.href ?? "", item) ? item : null;
    })
    .filter(Boolean);

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
          height: "85dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          paddingBottom: 10,
        }}
      >
        {/* HEADER */}
        <div
          style={{
            height: 56,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
          }}
        >
          <Group justify={collapsed ? "center" : "space-between"}>
            <ActionIcon variant="light" size="sm" onClick={toggle}>
              {collapsed ? (
                <IconMenu2 size={18} />
              ) : (
                <IconChevronLeft size={18} />
              )}
            </ActionIcon>
          </Group>
        </div>

        {/* MENU */}
        <div
          className="sidebar-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            paddingBottom: 40,
          }}
        >
          <Stack p="sm" gap="md">
            {filteredItems.map((it) => renderNavItem(it))}

            <NavLink
              leftSection={<IconLogout />}
              label={t("logout", { default: "Đăng xuất" })}
              onClick={() => setConfirmOpen(true)}
            />
          </Stack>
        </div>
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
