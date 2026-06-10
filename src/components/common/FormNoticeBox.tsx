"use client";

import { Box, Paper, Group, ThemeIcon, Text } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

interface FormNoticeBoxProps {
  title?: string; // tiêu đề (mặc định: Chú ý)
  message?: string; // nội dung mô tả
  iconColor?: string; // màu icon (mặc định: blue)
  sticky?: boolean; // có dính ở cuối trang không
}

export default function FormNoticeBox({
  title = "Chú ý",
  message = "Các trường có dấu * là bắt buộc nhập",
  iconColor = "blue",
  sticky = true,
}: FormNoticeBoxProps) {
  return (
    <Box
      style={{
        marginTop: 20,
        position: sticky ? "sticky" : "relative",
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: "1px solid #eee",
        paddingTop: "12px",
        paddingBottom: "12px",
        background: "#fff",
        zIndex: 10,
      }}
    >
      <Paper
        withBorder
        shadow="xs"
        p="md"
        radius="md"
        style={{ backgroundColor: "#f8fbff" }}
      >
        <Group align="flex-start" gap="sm">
          <ThemeIcon color={iconColor} variant="light" radius="xl">
            <IconInfoCircle size={18} />
          </ThemeIcon>
          <div>
            <Text fw={600} size="sm">
              {title}
            </Text>
            <Text size="sm" c="dimmed">
              {message}
            </Text>
          </div>
        </Group>
      </Paper>
    </Box>
  );
}
