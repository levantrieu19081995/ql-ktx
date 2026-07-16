"use client";

import { Box, Group, Text, Title } from "@mantine/core";
import { IconCategory } from "@tabler/icons-react";
import { ReactNode } from "react";

type PageSectionHeaderProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  rightSection?: ReactNode;
  titleOrder?: 1 | 2 | 3 | 4 | 5 | 6;
};

export default function PageSectionHeader({
  title,
  description,
  icon,
  rightSection,
  titleOrder = 3,
}: PageSectionHeaderProps) {
  return (
    <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
      <Group gap="sm" align="center">
        <Box className="page-section-header-icon">
          {icon || <IconCategory size={20} />}
        </Box>
        <Box>
          <Title
            order={titleOrder}
            c="#172033"
            fw={650}
            style={{
              letterSpacing: "-0.015em",
              lineHeight: 1.25,
            }}
          >
            {title}
          </Title>
          {description && (
            <Text c="dimmed" size="sm">
              {description}
            </Text>
          )}
        </Box>
      </Group>

      {rightSection}

      <style
        dangerouslySetInnerHTML={{
          __html: `
.page-section-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1f5ca9;
  background: #eff6ff;
  flex-shrink: 0;
}
`,
        }}
      />
    </Group>
  );
}
