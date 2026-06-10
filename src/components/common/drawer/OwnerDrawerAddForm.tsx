// src/components/common/OwnerDrawerForm.tsx
"use client";

import {
  Box,
  Button,
  Drawer,
  Flex,
  Group,
  ScrollArea,
  Select,
  Stack,
  TextInput,
  Title,
  Text,
  ActionIcon,
} from "@mantine/core";
import FormNoticeBox from "@/components/common/FormNoticeBox";
import { ChuPhuongTienPut } from "@/types/type-chu-phuong-tien";
import { useEffect, useState } from "react";
import { Label } from "recharts";
import { IconTypography } from "@tabler/icons-react";
import { convertVNUorTCVN3ToUnicode } from "@/utils/coverVNUToUnicode";

type Props = {
  opened: boolean;
  onClose: () => void;
  onSubmit: () => void;
  value: ChuPhuongTienPut;
  onChange: (next: ChuPhuongTienPut) => void;
};

export default function OwnerDrawerAddForm({
  opened,
  onClose,
  value,
  onChange,
  onSubmit,
}: Props) {
  return (
    <Drawer
      size="50%"
      position="right"
      opened={opened}
      onClose={onClose}
      title={
        <Box>
          <Title order={4}>Thêm thông tin chủ sở hửu</Title>
        </Box>
      }
    >
      <Flex direction="column" style={{ height: "100%" }}>
        <ScrollArea style={{ flex: 1, paddingRight: 8 }}>
          <Stack gap="sm">
            <TextInput
              label="Tên chủ sở hữu"
              placeholder="Nhập tên chủ sở hữu"
              value={value.ttcptTen ?? ""}
              onChange={(e) =>
                onChange({ ...value, ttcptTen: e.currentTarget.value })
              }
              rightSection={
                <ActionIcon
                  variant="light"
                  title="Hoán chuyển VNU → Unicode"
                  onClick={async () => {
                    const fixed = await convertVNUorTCVN3ToUnicode(
                      value.ttcptTen || ""
                    );
                    onChange({ ...value, ttcptTen: fixed });
                  }}
                >
                  <IconTypography size={16} />
                </ActionIcon>
              }
            />

            <TextInput
              label="Địa chỉ"
              placeholder="Nhập địa chỉ chủ sở hữu"
              value={value.ttcptDiachi ?? ""}
              onChange={(e) =>
                onChange({ ...value, ttcptDiachi: e.currentTarget.value })
              }
              rightSection={
                <ActionIcon
                  variant="light"
                  title="Hoán chuyển VNU → Unicode"
                  onClick={async () => {
                    const fixed = await convertVNUorTCVN3ToUnicode(
                      value.ttcptDiachi || ""
                    );
                    onChange({ ...value, ttcptDiachi: fixed });
                  }}
                >
                  <IconTypography size={16} />
                </ActionIcon>
              }
            />

            <TextInput
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              value={value.ttcptSodienthoai}
              onChange={(e) =>
                onChange({
                  ...value,
                  ttcptSodienthoai: e.currentTarget.value,
                })
              }
            />

            <Select
              label="Loại chủ sở hữu"
              placeholder="Chọn loại"
              data={[
                { value: "0", label: "Cá nhân" },
                { value: "1", label: "Doanh nghiệp" },
              ]}
              value={String(value.ttcptIsDoanhNghiep)}
              onChange={(val) =>
                onChange({ ...value, ttcptIsDoanhNghiep: Number(val) })
              }
              comboboxProps={{
                withinPortal: false,
                position: "bottom",
              }}
              maxDropdownHeight={260}
            />

            <TextInput
              label={`CCCD`}
              placeholder="Nhập số CCCD"
              value={value.ttcptCccd}
              onChange={(e) =>
                onChange({ ...value, ttcptCccd: e.currentTarget.value })
              }
            />

            <TextInput
              label={`Mã số thuế ${value.ttcptIsDoanhNghiep === 1 ? "*" : ""}`}
              placeholder="Nhập mã số thuế (nếu có)"
              value={value.ttcptMasothue}
              onChange={(e) =>
                onChange({ ...value, ttcptMasothue: e.currentTarget.value })
              }
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={onClose}>
                Hủy
              </Button>
              <Button color="blue" onClick={onSubmit}>
                Lưu thông tin
              </Button>
            </Group>
          </Stack>
        </ScrollArea>
        <Box>
          <FormNoticeBox />
        </Box>
      </Flex>
    </Drawer>
  );
}
