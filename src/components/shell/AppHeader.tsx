"use client";

import { Avatar, Box, Group, Menu, Text } from "@mantine/core";
import {
  IconChevronDown,
  IconLogout,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useLocale } from "next-intl";

import logo from "@/assets/images/CTU_logo.png";
import { useUser } from "@/context/UserContext";
import { useSessionStore } from "@/context/sessionStore";
import { fetchUserAPI } from "@/services/auth/authService";
import { fetchConfigSystem } from "@/services/setting/settingSystemInfoService";

import LocaleSwitcher from "./LocaleSwitcher";

type Props = {
  opened: boolean;
  onBurgerClick: () => void;
};

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
  address: "Khu II, Duong 3/2, Xuan Khanh, Ninh Kieu, Can Tho",
  phone: "+84 292 3832 663",
  email: "dhct@ctu.edu.vn",
  description:
    "He thong quan ly Ky tuc xa Dai hoc Can Tho. Van hanh thong minh va theo doi sinh vien vao ra.",
  logoDataUrl: null,
};

export default function AppHeader({ opened, onBurgerClick }: Props) {
  const locale = useLocale();
  const { user } = useUser();
  const name = user?.ten || user?.ten || "User";

  const [titleConfig, setTitleConfig] = useState<string>(
    DEFAULT_SETTINGS.title,
  );
  const [logoConfig, setLogoConfig] = useState<string>("");
  const [fullUser, setFullUser] = useState<any>(null);
  const [loadingFullUser, setLoadingFullUser] = useState(false);
  const { accessToken, isHydrated } = useSessionStore();

  const getConfigAppDetails = async () => {
    try {
      const params: any = { group: "app", keyword: "*" };
      const configData = await fetchConfigSystem(params);
      console.log("[RUN_LOG] ===> AppHeader configData: ", configData);

      const filteredData = configData.payload.reduce((acc: any, item: any) => {
        if (item.config.key === "app.name") acc.name = item.value;
        if (item.config.key === "app.logo") acc.logo = item.value;
        return acc;
      }, {});

      setTitleConfig(filteredData.name || "Default App Name");
      setLogoConfig(filteredData.logo || "");
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  };

  const loadFullUser = async () => {
    if (!accessToken) return;
    try {
      const { expired } = useSessionStore.getState();
      if (expired && Date.now() > expired) {
        console.log(">>> Token het han -> mo modal");
        useSessionStore.getState().setIsExpired(true);
      }

      setLoadingFullUser(true);
      const data = await fetchUserAPI(accessToken);
      setFullUser(data);
    } catch (err) {
      console.error("Load full user error:", err);
    } finally {
      setLoadingFullUser(false);
    }
  };

  useEffect(() => {
    if (!isHydrated || !accessToken) return;
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
      align="center"
      style={{
        background: "#ffffff",
        paddingInline: "clamp(12px, 2.8vw, 36px)",
      }}
    >
      <Group
        gap="md"
        wrap="nowrap"
        style={{
          width: "auto",
          minWidth: "auto",
          flexShrink: 0,
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
              ĐẠI HỌC CẦN THƠ
            </Text>
            <Text fz={26} fw={900} c="blue.6" tt="uppercase" lh={1} mt={10}>
              {titleConfig || "Dang tai cau hinh..."}
            </Text>
          </Box>
        </Group>
      </Group>

      <Group
        gap={0}
        wrap="nowrap"
        style={{
          width: "auto",
          minWidth: "auto",
          minHeight: 64,
          padding: "9px 14px 9px 12px",
          borderRadius: 18,
          background: "#ffffff",
          border: "1px solid rgba(226, 232, 240, 0.95)",
          boxShadow:
            "0 18px 40px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)",
          flexShrink: 0,
          justifyContent: "flex-end",
        }}
      >
        <LocaleSwitcher
          size={41}
          style={{
            flexShrink: 0,
            boxShadow:
              "0 10px 24px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
          }}
        />

        <Box
          visibleFrom="sm"
          style={{
            width: 1,
            alignSelf: "stretch",
            marginInline: 16,
            background:
              "linear-gradient(180deg, transparent, #dbe4f0 18%, #dbe4f0 82%, transparent)",
          }}
        />

        <Menu
          shadow="xl"
          width={390}
          radius={15}
          withArrow={false}
          position="bottom-end"
          offset={12}
          onOpen={() => {
            if (!fullUser && !loadingFullUser) loadFullUser();
          }}
        >
          <Menu.Target>
            <Group
              gap={12}
              wrap="nowrap"
              style={{ cursor: "pointer", marginRight: 2, minWidth: 0 }}
            >
              <Avatar
                src={(user as any)?.avatar || undefined}
                radius="xl"
                size={41}
                styles={{
                  placeholder: {
                    color: "#FFFFFF",
                  },
                }}
                style={{
                  flexShrink: 0,
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #1f5ca9, #1f5ca9)",
                  // boxShadow: "0 14px 28px rgba(92, 29, 255, 0.24)",
                }}
              >
                {name ? name.charAt(0).toUpperCase() : null}
              </Avatar>

              <Box visibleFrom="sm" style={{ minWidth: 0, textAlign: "left" }}>
                <Text
                  fw={800}
                  c="#111827"
                  lh={1.15}
                  style={{
                    fontSize: "clamp(10px, 0.86vw, 13px)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fullUser?.caNhan?.ten ?? name ?? "Quan tri vien"}
                </Text>
                <Text
                  c="#667085"
                  lh={1.2}
                  mt={3}
                  style={{
                    fontSize: "clamp(8px, 0.64vw, 10px)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Admin
                </Text>
              </Box>

              <IconChevronDown
                size={18}
                color="#0f172a"
                style={{ flexShrink: 0, marginLeft: 3 }}
              />
            </Group>
          </Menu.Target>

          <Menu.Dropdown className="user-menu-dropdown" p={0}>
            <Box p={24} style={{ background: "#ffffff" }}>
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
                    Dang dang nhap
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
                    Quan tri vien
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
                Thong tin tai khoan
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
                Cai dat he thong
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
                  },
                }}
              >
                Dang xuat
              </Menu.Item>
            </Box>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
