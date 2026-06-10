"use client";

import { useSearchParams } from "next/navigation";
import { Card, Title, Text, Stack, Group, Avatar } from "@mantine/core";
import { useEffect, useState } from "react";
import { IconBook, IconBooks, IconShield } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export default function DocViewerPage() {
  const searchParams = useSearchParams()!;
  const file = searchParams.get("file");
  const title = searchParams.get("title");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const t = useTranslations("InstructionManual");
  useEffect(() => {
    if (file) {
      const origin = window.location.origin;
      const url = `${origin}/doc/${file}`;
      setPdfUrl(url);
    }
  }, [file]);

  if (!file) {
    return (
      <Card p="xl" radius="lg" shadow="md" mt="xl" ta="center">
        <Text>Không có tài liệu nào được chọn.</Text>
      </Card>
    );
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between" align="flex-end">
        <Group>
          <Avatar radius="sm" color="indigo">
            <IconBooks size={18} />
          </Avatar>
          <Title order={3}>
            {t("title")}
            {" ("}
            {title || file.replace(".pdf", "").replaceAll("_", " ")} {")"}
          </Title>
        </Group>
      </Group>
      <Card
        withBorder
        radius="lg"
        shadow="sm"
        p="md"
        style={{
          height: "calc(100vh - 120px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {pdfUrl ? (
          // <iframe
          //   src={pdfUrl}
          //   style={{
          //     flex: 1,
          //     width: "100%",
          //     border: "none",
          //     borderRadius: "8px",
          //   }}
          //   title="PDF Viewer"
          // />

          <iframe
            src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
              pdfUrl
            )}`}
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        ) : (
          <Text ta="center" c="dimmed">
            Đang tải tài liệu...
          </Text>
        )}
      </Card>
    </Stack>
  );
}
