"use client";

import { useTranslations } from "next-intl";
import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCalendar,
  IconCaretUpFilled,
  IconClick,
  IconDownload,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconHeartFilled,
  IconSearch,
  IconEye,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconChartBar,
} from "@tabler/icons-react";

function KPI({
  icon,
  iconBg,
  title,
  value,
  delta,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string;
  delta: string;
}) {
  return (
    <Card withBorder radius="lg" p="lg">
      <Group align="flex-start" gap="md">
        <Box
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            background: iconBg,
          }}
        >
          {icon}
        </Box>
        <Stack gap={6} style={{ flex: 1 }}>
          <Text c="dimmed" fw={700} size="lg">
            {title}
          </Text>
          <Title order={2} fw={900}>
            {value}
          </Title>
          <Group gap={6}>
            <IconCaretUpFilled size={14} color="#16a34a" />
            <Text c="teal.6" fw={700}>
              {delta}
            </Text>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}

function ZaloBadge() {
  return (
    <Badge variant="light" color="blue" radius="sm" px={8} py={4} fw={700}>
      Zalo OA
    </Badge>
  );
}

export default function AnalyticsPage() {
  const t = useTranslations("Analytics");

  return (
    <Stack gap="xl">
      {/* Header */}
      <Group justify="space-between">
        <Group>
          <ThemeIcon size={38} variant="light" color="indigo">
            <IconChartBar size={20} />
          </ThemeIcon>
          <Title order={3}>{t("title")}</Title>
        </Group>
      </Group>
      {/* FILTER BAR */}
      <Card withBorder radius="lg" p="lg">
        <SimpleGrid cols={{ base: 1, md: 4 }} spacing="md">
          <div>
            <Text c="dimmed" size="sm" mb={6}>
              {t("filters.creator")}
            </Text>
            <Select
              placeholder={t("filters.all")}
              data={[t("filters.all"), "Admin", "Editor", "Member"]}
              variant="filled"
              radius="md"
              leftSection={<IconSearch size={16} />}
              styles={{ input: { height: 40 } }}
            />
          </div>

          <div>
            <Text c="dimmed" size="sm" mb={6}>
              {t("filters.platform")}
            </Text>
            <Select
              placeholder={t("filters.all")}
              data={[
                t("filters.all"),
                "Facebook",
                "Instagram",
                "LinkedIn",
                "Zalo",
              ]}
              variant="filled"
              radius="md"
              styles={{ input: { height: 40 } }}
            />
          </div>

          <div>
            <Text c="dimmed" size="sm" mb={6}>
              {t("filters.postType")}
            </Text>
            <Select
              placeholder={t("filters.all")}
              data={[
                t("filters.all"),
                t("post.sale"),
                t("post.intro"),
                t("post.hiring"),
              ]}
              variant="filled"
              radius="md"
              styles={{ input: { height: 40 } }}
            />
          </div>

          <div>
            <Text c="dimmed" size="sm" mb={6}>
              {t("filters.time")}
            </Text>
            <TextInput
              placeholder={t("filters.all")}
              rightSection={<IconCalendar size={16} />}
              variant="filled"
              radius="md"
              styles={{ input: { height: 40 } }}
            />
          </div>
        </SimpleGrid>

        <Group mt="md" justify="space-between">
          <Group>
            <Button
              variant="light"
              color="green"
              leftSection={<IconFileSpreadsheet size={18} />}
              radius="md"
            >
              {t("export.excel")}
            </Button>
            <Button
              variant="light"
              color="red"
              leftSection={<IconFileTypePdf size={18} />}
              radius="md"
            >
              {t("export.pdf")}
            </Button>
          </Group>

          <Group>
            <Button variant="default" radius="md">
              {t("actions.reset")}
            </Button>
            <Button color="indigo" radius="md">
              {t("actions.apply")}
            </Button>
          </Group>
        </Group>
      </Card>

      {/* KPI ROW */}
      <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="lg">
        <KPI
          icon={<IconEye size={20} color="#6E7CF6" />}
          iconBg="linear-gradient(135deg,#E9EBFF,#F3F5FF)"
          title={t("kpi.views")}
          value="2.4M"
          delta={t("kpi.deltaPrev", { value: "15.3%" })}
        />
        <KPI
          icon={<IconHeartFilled size={20} color="#2FBF71" />}
          iconBg="linear-gradient(135deg,#E8FFF3,#F6FFF9)"
          title={t("kpi.engagement")}
          value="186K"
          delta={t("kpi.rateUp", { value: "8.7%" })}
        />
        <KPI
          icon={<IconClick size={20} color="#D6AC00" />}
          iconBg="linear-gradient(135deg,#FFF9E6,#FFFBF0)"
          title={t("kpi.clicks")}
          value="12.3K"
          delta={t("kpi.rateUp", { value: "12.1%" })}
        />
        <KPI
          icon={<IconDownload size={20} color="#8B5CF6" />}
          iconBg="linear-gradient(135deg,#F5E9FF,#FBF6FF)"
          title={t("kpi.shares")}
          value="4.2K"
          delta={t("kpi.rateUp", { value: "22.4%" })}
        />
      </SimpleGrid>

      {/* PERFORMANCE + TOP POSTS */}
      <Grid gutter="xl">
        {/* Hiệu suất theo nền tảng */}
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Card withBorder radius="lg" p="lg">
            <Title order={4} mb="lg">
              Hiệu suất theo nền tảng
            </Title>

            <Stack gap="xl">
              {/* Facebook */}
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm">
                  <IconBrandFacebook size={22} color="#1877F2" />
                  <Text fw={600}>Facebook</Text>
                </Group>
                <Stack gap={2} ta="right">
                  <Text fw={800}>1.2M lượt xem</Text>
                  <Text c="dimmed">89K tương tác</Text>
                </Stack>
              </Group>

              {/* Instagram */}
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm">
                  <IconBrandInstagram size={22} color="#E4405F" />
                  <Text fw={600}>Instagram</Text>
                </Group>
                <Stack gap={2} ta="right">
                  <Text fw={800}>856K lượt xem</Text>
                  <Text c="dimmed">67K tương tác</Text>
                </Stack>
              </Group>

              {/* LinkedIn */}
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm">
                  <IconBrandLinkedin size={22} color="#0A66C2" />
                  <Text fw={600}>LinkedIn</Text>
                </Group>
                <Stack gap={2} ta="right">
                  <Text fw={800}>666K lượt xem</Text>
                  <Text c="dimmed">45K tương tác</Text>
                </Stack>
              </Group>

              {/* Zalo OA */}
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm">
                  <ZaloBadge />
                </Group>
                <Stack gap={2} ta="right">
                  <Text fw={800}>234K lượt xem</Text>
                  <Text c="dimmed">23K tương tác</Text>
                </Stack>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Top bài viết hiệu quả */}
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Card withBorder radius="lg" p="lg">
            <Title order={4} mb="lg">
              Top bài viết hiệu quả
            </Title>

            <Stack gap="md">
              <Card
                withBorder
                radius="lg"
                p="lg"
                style={{ background: "#F9FAFB" }}
              >
                <Text fw={800} mb={6}>
                  Khuyến mãi Black Friday 08/2025
                </Text>
                <Text c="dimmed" mb="sm">
                  234K lượt xem • 12K tương tác
                </Text>
                <Group gap="xs">
                  <IconBrandFacebook size={18} color="#1877F2" />
                  <IconBrandInstagram size={18} color="#E4405F" />
                </Group>
              </Card>

              <Card
                withBorder
                radius="lg"
                p="lg"
                style={{ background: "#F9FAFB" }}
              >
                <Text fw={800} mb={6}>
                  Giới thiệu sản phẩm sắp ra mắt
                </Text>
                <Text c="dimmed" mb="sm">
                  234K lượt xem • 12K tương tác
                </Text>
                <Group gap="xs">
                  <IconBrandLinkedin size={18} color="#0A66C2" />
                  <ZaloBadge />
                </Group>
              </Card>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
