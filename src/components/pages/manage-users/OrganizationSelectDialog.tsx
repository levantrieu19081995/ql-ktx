"use client";

import { Box, Button, Group, Modal, Select, Stack, Text } from "@mantine/core";
import React, { useState } from "react";

interface OrganizationSelectDialogProps {
  opened: boolean;
  onClose: () => void;
  userName?: string;
  organizations: { id: number; name: string }[];
  onConfirm: (selectedOrgId: number) => void;
  loading?: boolean;
}

export default function OrganizationSelectDialog({
  opened,
  onClose,
  userName,
  organizations,
  onConfirm,
  loading = false,
}: OrganizationSelectDialogProps) {
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Box>
          <b style={{ color: "blue" }}>Chọn đơn vị cần xóa</b>
        </Box>
      }
      centered
      radius="md"
      size="sm"
    >
      <Stack>
        <Text size="sm">
          Người dùng <b>{userName}</b> hiện đang thuộc các đơn vị sau:
        </Text>

        <Select
          label="Chọn đơn vị muốn xóa"
          placeholder="Chọn một đơn vị..."
          data={organizations.map((o) => ({
            value: String(o.id),
            label: o.name,
          }))}
          value={selectedOrg}
          onChange={setSelectedOrg}
          searchable
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Hủy
          </Button>
          <Button
            color="orange"
            disabled={!selectedOrg}
            loading={loading}
            onClick={() => {
              if (selectedOrg) onConfirm(Number(selectedOrg));
            }}
          >
            Tiếp tục
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
