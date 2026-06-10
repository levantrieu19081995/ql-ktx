"use client";

import { Modal, TextInput, Button, Group, Stack, Text } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";

export default function PaymentEditModal({
  opened,
  onClose,
  value,
  onChange,
  onSubmit,
  loading,
}: {
  opened: boolean;
  onClose: () => void;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="md"
      overlayProps={{ opacity: 0.25, blur: 3 }}
      title={
        <Group>
          <IconPencil size={20} />
          <Text fw={600}>Chỉnh sửa tên phí</Text>
        </Group>
      }
    >
      <Stack gap="sm" p="xs">
        <TextInput
          label="Tên phí"
          placeholder="Nhập tên phí mới..."
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          radius="md"
          size="md"
          required
        />

        <Group mt="md" justify="flex-end">
          <Button variant="light" radius="md" onClick={onClose}>
            Hủy
          </Button>
          <Button radius="md" color="blue" onClick={onSubmit} loading={loading}>
            Lưu thay đổi
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
