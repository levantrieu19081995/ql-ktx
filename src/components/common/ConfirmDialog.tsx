import React from "react";
import { Modal, Stack, ThemeIcon, Text, Group, Button } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

interface ConfirmDialogProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  reloginLabel?: string;
  continueLabel?: string;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  opened,
  onClose,
  onConfirm,
  title = "Xác nhận hành động",
  message = "Bạn có chắc chắn muốn thực hiện thao tác này?",
  reloginLabel = "Hủy",
  continueLabel = "Đồng ý",
  loading = false,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      size="sm"
      withCloseButton={false}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <Stack align="center">
        <ThemeIcon color="yellow" radius="xl" size={64} variant="light">
          <IconAlertTriangle size={36} />
        </ThemeIcon>

        <Text fw={600} size="lg" style={{ textAlign: "center" }}>
          {title}
        </Text>
        <Text size="sm" color="dimmed" style={{ textAlign: "center" }}>
          {message}
        </Text>

        <Group mt="sm" justify="center">
          <Button
            variant="outline"
            color="gray"
            onClick={onClose}
            radius="md"
            disabled={loading}
          >
            {reloginLabel}
          </Button>
          <Button
            color="indigo"
            onClick={onConfirm}
            radius="md"
            loading={loading}
          >
            {continueLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ConfirmDialog;
