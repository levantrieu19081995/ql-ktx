"use client";

import {
  Card,
  Title,
  Paper,
  Group,
  Stack,
  Image,
  Avatar,
  Badge,
  Text,
  Divider,
  SimpleGrid,
  ThemeIcon,
  Box,
} from "@mantine/core";
import {
  IconMapPin,
  IconPhone,
  IconMail,
  IconClockHour4,
} from "@tabler/icons-react";

type Props = {
  values: any;
  previewColor: string;
};

export default function SettingPreview({ values, previewColor }: Props) {
  const fallbackLogo = "/images/logo.png";
  return (
    <Card withBorder>
      <Title order={5} mb="md">
        Xem trước
      </Title>

      <Paper
        p="lg"
        radius="md"
        withBorder
        style={{
          borderColor: previewColor,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.00) 100%)",
        }}
      >
        <Group align="flex-start" wrap="nowrap">
          {values.logoDataUrl ? (
            <Image
              src={values.logoDataUrl}
              alt="Logo preview"
              radius="md"
              w={56}
              h={56}
              fit="contain"
            />
          ) : fallbackLogo ? (
            <Image
              src={fallbackLogo}
              alt="Default logo"
              radius="md"
              w={56}
              h={56}
              fit="contain"
            />
          ) : (
            <Avatar size={56} radius="md" variant="filled" color="gray">
              {values.title?.slice(0, 2).toUpperCase()}
            </Avatar>
          )}

          <Stack gap={4} flex={1}>
            <Group gap={8}>
              <Title order={4} style={{ color: previewColor }}>
                {values.title || "Tên công ty"}
              </Title>
            </Group>
            <Text c="dimmed" size="sm">
              {values.description || "Mô tả công ty hiển thị ở đây…"}
            </Text>

            <Divider my="sm" />

            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Group gap={8} align="flex-start" wrap="nowrap">
                <ThemeIcon
                  variant="light"
                  style={{
                    color: previewColor,
                    borderColor: previewColor,
                    flexShrink: 0,
                  }}
                >
                  <IconMapPin size={16} />
                </ThemeIcon>
                <Text
                  size="sm"
                  style={{
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                    lineHeight: 1.4,
                  }}
                >
                  {values.address || "—"}
                </Text>
              </Group>

              <Group gap={8}>
                <ThemeIcon
                  variant="light"
                  style={{ color: previewColor, borderColor: previewColor }}
                >
                  <IconPhone size={16} />
                </ThemeIcon>
                <Text size="sm">{values.phone || "—"}</Text>
              </Group>

              <Group gap={8}>
                <ThemeIcon
                  variant="light"
                  style={{ color: previewColor, borderColor: previewColor }}
                >
                  <IconMail size={16} />
                </ThemeIcon>
                <Text size="sm">{values.email || "—"}</Text>
              </Group>

              <Group gap={8}>
                <ThemeIcon variant="light" color="gray">
                  <IconClockHour4 size={16} />
                </ThemeIcon>
                <Text size="sm">Cập nhật theo thời gian thực</Text>
              </Group>
            </SimpleGrid>
          </Stack>
        </Group>
      </Paper>

      <Box mt="md">
        <Text size="sm" c="dimmed">
          * Cài đặt (gồm cả logo) được lưu cục bộ bằng <b>localStorage</b>. Khi
          cần, thay hàm “Lưu cài đặt” để gọi API POST/PUT lên server.
        </Text>
      </Box>
    </Card>
  );
}
