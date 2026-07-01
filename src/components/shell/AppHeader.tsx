"use client";
import {
  Group,
  Text,
  Box,
  ActionIcon,
  Menu,
  Avatar,
  Card,
  Stack,
  TextInput,
  Indicator,
} from "@mantine/core";
import Image from "next/image";
import { useLocale } from "next-intl";
import { signOut } from "next-auth/react";
import {
  IconBell,
  IconChevronDown,
  IconLogout,
  IconSearch,
  IconSettings,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import LocaleSwitcher from "./LocaleSwitcher";
import logo from "@/assets/images/CTU_logo.png";
import { useUser } from "@/context/UserContext";
import { fetchConfigSystem } from "@/services/setting/settingSystemInfoService";
import { useEffect, useState } from "react";
// import { ConfigSystemRequest } from "@/types/global";

import { useSession } from "next-auth/react";
import { fetchUserAPI } from "@/services/auth/authService";
import { useSessionStore } from "@/context/sessionStore";

type Props = {
  opened: boolean;
  onBurgerClick: () => void;
};

const BRAND_RED = "#E2433E";
const BRAND_BLUE = "#567EC4";

type CompanySettings = {
  title: string;
  primaryColor: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  logoDataUrl?: string | null;
};

const DEFAULT_SETTINGS: CompanySettings = {
  title: "QUẢN LÝ KÝ TÚC XÁ",
  primaryColor: "#4C6EF5",
  address: "Khu II, Đường 3/2, Xuân Khánh, Ninh Kiều, Cần Thơ",
  phone: "+84 292 3832 663",
  email: "dhct@ctu.edu.vn",
  description:
    "Hệ thống quản lý Ký túc xá Đại học Cần Thơ. Vận hành thông minh và theo dõi sinh viên vào ra.",
  logoDataUrl: null,
};

export default function AppHeader({ opened, onBurgerClick }: Props) {
  const locale = useLocale();

  const { user } = useUser();
  const { data: session } = useSession();
  const name = user?.ten || user?.ten || "User";

  const [titleConfig, setTitleConfig] = useState<string>(
    DEFAULT_SETTINGS.title,
  ); // Đặt giá trị mặc định
  const [logoConfig, setLogoConfig] = useState<string>("");

  const getConfigAppDetails = async () => {
    try {
      // Đặt params để lấy cả app.name và app.logo
      // const params: ConfigSystemRequest = { group: "app", keyword: "*" }; // Lấy tất cả key trong group "app"
      const params: any = { group: "app", keyword: "*" }; // Lấy tất cả key trong group "app"

      // Gọi API để lấy dữ liệu
      const configData = await fetchConfigSystem(params);
      console.log("[RUN_LOG] ===> AppHeader  configData: ", configData);

      // Lọc và xử lý dữ liệu từ API để lấy app.name và app.logo
      const filteredData = configData.payload.reduce((acc: any, item: any) => {
        if (item.config.key === "app.name") {
          acc.name = item.value; // Lưu giá trị app.name
        }
        if (item.config.key === "app.logo") {
          acc.logo = item.value; // Lưu giá trị app.logo
        }
        return acc;
      }, {});

      // Cập nhật lại giá trị cho app.name và app.logo (thêm logic xử lý nếu cần)
      const appName = filteredData.name || "Default App Name"; // Nếu không có giá trị, dùng giá trị mặc định
      const appLogo = filteredData.logo || ""; // Nếu không có logo, giữ giá trị mặc định là rỗng
      setTitleConfig(appName);
      setLogoConfig(appLogo);
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  };

  const [fullUser, setFullUser] = useState<any>(null);
  const [loadingFullUser, setLoadingFullUser] = useState(false);
  const { accessToken, isHydrated } = useSessionStore();
  const loadFullUser = async () => {
    // if (!session?.accessToken) return;
    // const data = await fetchUserAPI(session.accessToken); // <<< dùng lại API sẵn có
    if (!accessToken) return; // chờ token có
    try {
      const { expired } = useSessionStore.getState();

      if (expired && Date.now() > expired) {
        console.log(">>> Token hết hạn → mở modal");
        useSessionStore.getState().setIsExpired(true);
      }

      setLoadingFullUser(true);
      const data = await fetchUserAPI(accessToken); // <<< dùng lại API sẵn có
      setFullUser(data);
    } catch (err) {
      console.error("Load full user error:", err);
    } finally {
      setLoadingFullUser(false);
    }
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (!accessToken) return;

    getConfigAppDetails();
  }, [isHydrated, accessToken]);

  useEffect(() => {
    if (!logoConfig) return;

    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    link.href = logoConfig;
  }, [logoConfig]);

  return (
    <Group
      h="100%"
      px={0}
      wrap="nowrap"
      justify="space-between"
      align="center" // thêm để 3 block đứng đúng trên mobile
      style={{
        background: "#ffffff",
        paddingInline: "clamp(12px, 2.8vw, 36px)",
      }}
    >
      {/* ============ LEFT: LOGO (260px) ============ */}
      <Group
        gap="md"
        wrap="nowrap"
        style={{
          width: "auto",
          minWidth: "auto",
          flexShrink: 0, // không cho ép nhỏ logo
          justifyContent: "flex-start",
        }}
      >
        <Group gap="sm" wrap="nowrap" visibleFrom="md">
          <Image
            src={logoConfig || logo}
            alt={titleConfig}
            width={90}
            height={90}
            priority
            unoptimized
            style={{
              borderRadius: 8,
              marginLeft: 45,
              marginRight: 25,
              objectFit: "contain",
            }}
          />
          <Box>
            <Text fz={22} fw={700} c="gray.7" tt="uppercase" lh={1}>
              Đại học Cần Thơ
            </Text>

            <Text fz={26} fw={900} c="blue.6" tt="uppercase" lh={1} mt={10}>
              {titleConfig || "Đang tải cấu hình..."}
            </Text>
          </Box>
        </Group>
      </Group>

      {/* ============ CENTER: TITLE (FLEX 1) ============ */}
      <Box
        style={{
          flex: "1 1 auto",
          minWidth: 0,
          textAlign: "center",
          padding: "4px 0",
          wordBreak: "break-word", // cho phép xuống hàng
        }}
      >
        <Text
          hidden
          fw={900}
          c={BRAND_BLUE}
          style={{
            fontSize: "26px",
            letterSpacing: "2.4px",
            lineHeight: 1.2,
            whiteSpace: "normal", // cho phép xuống hàng
          }}
        >
          QUẢN LÝ KÝ TÚC XÁ
        </Text>
      </Box>

      {/* ============ RIGHT: USER BLOCK ============ */}
      <Group
        gap="xs"
        wrap="nowrap"
        style={{
          width: "auto",
          minWidth: "auto",
          flexShrink: 0, // không bị ép
          justifyContent: "flex-end",
          columnGap: "clamp(10px, 1.2vw, 16px)",
        }}
      >
        <TextInput
          visibleFrom="lg"
          w={320}
          radius="md"
          size="md"
          placeholder="Tìm kiếm..."
          leftSection={<IconSearch size={18} />}
          rightSectionWidth={72}
          rightSection={
            <Text size="xs" c="#64748b" fw={700}>
              Ctrl + K
            </Text>
          }
          styles={{
            input: {
              height: 42,
              borderColor: "#dfe6f2",
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.035)",
            },
          }}
        />

        <LocaleSwitcher size={42} />

        <Menu
          shadow="xl"
          width={390}
          radius={15}
          withArrow={false}
          position="bottom-end"
          offset={8}
        >
          <Menu.Target>
            <Group gap="sm" wrap="nowrap" style={{ cursor: "pointer" }}>
              <Avatar
                src={(user as any)?.avatar || undefined}
                radius="xl"
                size={40}
                color="blue"
                style={{ background: "#1557ff" }}
              >
                {name ? name.charAt(0).toUpperCase() : null}
              </Avatar>
              <Box visibleFrom="sm">
                <Text fw={800} size="sm" c="#0f172a" lh={1.2}>
                  {fullUser?.caNhan?.ten ?? name ?? "Quản trị viên"}
                </Text>
                <Text size="sm" c="#64748b">
                  Admin
                </Text>
              </Box>
              <IconChevronDown size={18} color="#0f172a" />
            </Group>
          </Menu.Target>
          <Menu.Dropdown className="user-menu-dropdown" p={0}>
            <Box
              p={24}
              style={{
                background: "#ffffff",
              }}
            >
              <Group gap="md" wrap="nowrap">
                <Avatar
                  src={(user as any)?.avatar || undefined}
                  size={76}
                  radius="50%"
                  style={{
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #5b6ff5, #1d5cff)",
                    border: "1px solid rgba(255,255,255,.96)",
                    boxShadow:
                      "0 12px 30px rgba(37,99,235,.22), inset 0 0 0 1px rgba(255,255,255,.35)",
                    flexShrink: 0,
                  }}
                >
                  {(fullUser?.caNhan?.ten ?? name ?? "U")
                    .charAt(0)
                    .toUpperCase()}
                </Avatar>

                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    fz={15}
                    fw={600}
                    c="#6B7280"
                    style={{
                      letterSpacing: "-0.2px",
                      lineHeight: 1.3,
                    }}
                  >
                    Đang đăng nhập
                  </Text>

                  <Text
                    fz={28}
                    fw={700}
                    c="#111827"
                    style={{
                      letterSpacing: "-0.8px",
                      lineHeight: 1.15,
                    }}
                  >
                    {fullUser?.caNhan?.ten ?? fullUser?.username ?? name}
                  </Text>

                  <Text
                    fz={16}
                    fw={500}
                    c="#6B7280"
                    style={{
                      letterSpacing: "-0.15px",
                    }}
                  >
                    Quản trị viên
                  </Text>
                </Box>
              </Group>
            </Box>

            <Box
              px={22}
              py={14}
              style={{
                background: "#ffffff",
                borderTop: "1px solid #eef2f7",
              }}
            >
              <Menu.Item
                leftSection={<IconUser size={20} color="#2563eb" />}
                rightSection={
                  <IconChevronDown
                    size={16}
                    color="#64748b"
                    style={{ rotate: "-90deg" }}
                  />
                }
                styles={{
                  item: {
                    borderRadius: 16,
                    padding: "15px 16px",

                    fontWeight: 600,
                    fontSize: "18px",
                    color: "#1F2937",
                    background: "#ffffff",
                  },
                }}
              >
                Thông tin tài khoản
              </Menu.Item>

              <Menu.Item
                leftSection={<IconSettings size={20} color="#2563eb" />}
                rightSection={
                  <IconChevronDown
                    size={16}
                    color="#64748b"
                    style={{ rotate: "-90deg" }}
                  />
                }
                styles={{
                  item: {
                    borderRadius: 16,
                    padding: "15px 16px",
                    fontWeight: 600,
                    fontSize: "18px",
                    color: "#1F2937",
                    background: "#ffffff",
                  },
                }}
              >
                Cài đặt hệ thống
              </Menu.Item>
            </Box>

            <Box
              px={22}
              py={16}
              style={{
                background: "#ffffff",
                borderTop: "1px solid #eef2f7",
              }}
            >
              <Menu.Item
                color="red"
                leftSection={<IconLogout size={20} />}
                onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                styles={{
                  item: {
                    borderRadius: 16,
                    padding: "15px 16px",
                    fontWeight: 700,
                    fontSize: "18px",
                    color: "#EF4444",
                    // background: "#fff5f5",
                  },
                }}
              >
                Đăng xuất
              </Menu.Item>
            </Box>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
