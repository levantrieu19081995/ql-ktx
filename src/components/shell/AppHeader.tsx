"use client";
import {
  Group,
  Burger,
  Text,
  Box,
  ActionIcon,
  Menu,
  Avatar,
  Tooltip,
  Card,
  Stack,
} from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { signOut } from "next-auth/react";
import { IconLogout } from "@tabler/icons-react";
import logo from "@/assets/images/CTU_logo.png";
import LocaleSwitcher from "./LocaleSwitcher";
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

  return (
    <Group
      px="md"
      wrap="wrap"
      justify="space-between"
      align="center" // thêm để 3 block đứng đúng trên mobile
      style={{
        backdropFilter: "saturate(160%) blur(10px)",
        WebkitBackdropFilter: "saturate(160%) blur(10px)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.55))",
      }}
    >
      {/* ============ LEFT: LOGO (260px) ============ */}
      <Group
        gap="xs"
        wrap="nowrap"
        style={{
          width: "260px",
          minWidth: "260px",
          flexShrink: 0, // không cho ép nhỏ logo
          justifyContent: "flex-start",
        }}
      >
        <Burger
          opened={opened}
          onClick={onBurgerClick}
          aria-label="Toggle sidebar"
          hiddenFrom="sm"
        />

        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <Image
            src={logo}
            alt="Quản lý ký túc xá"
            width={120}
            height={120}
            priority
            style={{
              borderRadius: 6,
              marginRight: 20,
              marginTop: 5,
              marginBottom: 5,
            }}
          />
        </Link>
      </Group>

      {/* ============ CENTER: TITLE (FLEX 1) ============ */}
      <Box
        style={{
          flex: 1,
          minWidth: "200px", // tránh bị ép nhỏ quá
          textAlign: "left",
          padding: "4px 0",
          wordBreak: "break-word", // cho phép xuống hàng
        }}
      >
        {/* <Text
          fw={900}
          c={BRAND_BLUE}
          style={{
            fontSize: "26px",
            letterSpacing: "2.4px",
            lineHeight: 1.2,
            whiteSpace: "normal", // cho phép xuống hàng
          }}
        >
          {titleConfig}
        </Text> */}
        <Text
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
          width: "140px",
          minWidth: "140px",
          flexShrink: 0, // không bị ép
          justifyContent: "flex-end",
        }}
      >
        <LocaleSwitcher size={40} />

        <Menu
          withArrow
          position="bottom-end"
          offset={8}
          transitionProps={{
            transition: "pop",
            duration: 200,
            timingFunction: "ease",
          }}
          onOpen={() => {
            if (!fullUser) loadFullUser();
          }}
        >
          <Menu.Target>
            <Tooltip label={name} openDelay={300}>
              <ActionIcon radius="xl" variant="light" size={40}>
                <Avatar
                  src={(user as any)?.avatar || undefined}
                  radius="xl"
                  size={36}
                  color="blue"
                >
                  {name ? name.charAt(0).toUpperCase() : null}
                </Avatar>
              </ActionIcon>
            </Tooltip>
          </Menu.Target>

          <Menu.Dropdown w={320} p="md">
            {loadingFullUser && (
              <Text size="sm" c="dimmed">
                Đang tải thông tin...
              </Text>
            )}

            {!loadingFullUser && fullUser && (
              <Card withBorder radius="md" p="md" mb="sm">
                <Stack gap={6}>
                  <Text size="sm" c="dimmed" fw={500}>
                    Đang đăng nhập:
                  </Text>

                  <Text fw={700} size="lg">
                    👤 {fullUser.caNhan?.ten ?? fullUser.username}
                  </Text>
                </Stack>
              </Card>
            )}

            <Menu.Item
              color="red"
              leftSection={<IconLogout size={16} />}
              onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
            >
              Đăng xuất
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
