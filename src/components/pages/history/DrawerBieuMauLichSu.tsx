/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect } from "react";
import {
  Button,
  TextInput,
  Select,
  Textarea,
  Drawer,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslations } from "next-intl";
import { IconChevronDown } from "@tabler/icons-react";
import { LUA_CHON_KTX } from "./history.mock";
import { HistoryItem } from "../../../types/type-history";

interface ThuocTinhDrawerBieuMauLichSu {
  open: boolean;
  onClose: () => void;
  onSave: (duLieu: Omit<HistoryItem, "id" | "thoiGian">) => Promise<void>;
  dangTao: boolean;
}

/**
 * Component Ngăn kéo thêm mới lịch sử ra vào (DrawerBieuMauLichSu).
 * Chức năng: Cung cấp biểu mẫu điền thông tin và thực hiện gọi API để ghi nhận lịch sử ra vào mới của sinh viên.
 */
export const DrawerBieuMauLichSu: React.FC<ThuocTinhDrawerBieuMauLichSu> = ({
  open,
  onClose,
  onSave,
  dangTao,
}) => {
  const t = useTranslations("History");

  const form = useForm({
    initialValues: {
      mssv: "",
      hoVaTen: "",
      maKtx: "",
      maPhong: "",
      loai: "IN",
      thietBi: "Cổng chính - Cam 01",
      ghiChu: "",
    },
    validate: {
      mssv: (value) =>
        value.length < 8 ? t("drawer.validateStudentId") : null,
      hoVaTen: (value) =>
        value.length < 3 ? t("drawer.validateFullName") : null,
      maKtx: (value) => (!value ? t("drawer.validateDorm") : null),
      maPhong: (value) => (!value ? t("drawer.validateRoom") : null),
      loai: (value) => (!value ? t("drawer.validateAction") : null),
      thietBi: (value) => (!value ? t("drawer.validateDevice") : null),
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open]);

  const xuLyGuiBieuMau = async (values: typeof form.values) => {
    try {
      const thongTinKtx = LUA_CHON_KTX.find(
        (tuyChon) => tuyChon.value === values.maKtx,
      );

      await onSave({
        mssv: values.mssv,
        hoVaTen: values.hoVaTen,
        maKtx: values.maKtx,
        tenKtx: thongTinKtx?.label ?? values.maKtx,
        maPhong: values.maPhong,
        tenPhong: `Phòng ${values.maPhong}`,
        loai: values.loai as "IN" | "OUT",
        thietBi: values.thietBi,
        ghiChu: values.ghiChu,
        duongDanAnhDaiDien:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
      });
      onClose();
    } catch {
      // Error is handled upstream
    }
  };

  const customChevron = (
    <IconChevronDown size={16} className="text-zinc-400 pointer-events-none" />
  );

  // Translate options dynamically
  const localizedKtxOptions = LUA_CHON_KTX.map((option) => {
    let localizedLabel = option.label;
    if (option.value === "A") localizedLabel = t("filter.dormA");
    else if (option.value === "B") localizedLabel = t("filter.dormB");
    else if (option.value === "C") localizedLabel = t("filter.dormC");
    else if (option.value === "D") localizedLabel = t("filter.dormD");
    return { ...option, label: localizedLabel };
  });

  return (
    <Drawer
      opened={open}
      onClose={onClose}
      title={<span className="drawer-title">{t("drawer.createTitle")}</span>}
      position="right"
      size={500}
      styles={{
        header: {
          borderBottom: "1px solid #f0f0f0",
          padding: "16px 24px",
          backgroundColor: "#fdfdfd",
        },
        body: {
          padding: "24px",
        },
      }}
    >
      <Stack gap="md" className="drawer-body-container">
        <form onSubmit={form.onSubmit(xuLyGuiBieuMau)} className="drawer-form">
          <TextInput
            label={t("drawer.studentIdLabel")}
            placeholder={t("drawer.studentIdPlaceholder")}
            required
            {...form.getInputProps("mssv")}
          />

          <TextInput
            label={t("drawer.fullNameLabel")}
            placeholder={t("drawer.fullNamePlaceholder")}
            required
            {...form.getInputProps("hoVaTen")}
          />

          <div className="grid-2-cols">
            <Select
              label={t("drawer.dormLabel")}
              placeholder={t("drawer.dormPlaceholder")}
              data={localizedKtxOptions}
              required
              rightSection={customChevron}
              {...form.getInputProps("maKtx")}
            />

            <TextInput
              label={t("drawer.roomLabel")}
              placeholder={t("drawer.roomPlaceholder")}
              required
              {...form.getInputProps("maPhong")}
            />
          </div>

          <div className="grid-2-cols">
            <Select
              label={t("drawer.actionLabel")}
              placeholder={t("drawer.actionPlaceholder")}
              data={[
                { value: "IN", label: t("drawer.actionIn") },
                { value: "OUT", label: t("drawer.actionOut") },
              ]}
              required
              rightSection={customChevron}
              {...form.getInputProps("loai")}
            />

            <TextInput
              label={t("drawer.deviceLabel")}
              placeholder={t("drawer.devicePlaceholder")}
              required
              {...form.getInputProps("thietBi")}
            />
          </div>

          <Textarea
            label={t("drawer.noteLabel")}
            placeholder={t("drawer.notePlaceholder")}
            rows={3}
            {...form.getInputProps("ghiChu")}
          />

          <div className="btn-group-right">
            <Button variant="default" onClick={onClose} className="btn-cancel">
              {t("drawer.cancelBtn")}
            </Button>
            <Button
              type="submit"
              loading={dangTao}
              className="btn-submit"
              style={{ backgroundColor: "#1f5ca9" }}
            >
              {t("drawer.saveBtn")}
            </Button>
          </div>
        </form>
      </Stack>
      <style dangerouslySetInnerHTML={{ __html: drawerStyles }} />
    </Drawer>
  );
};

const drawerStyles = `
.drawer-title {
    font-weight: bold;
    font-size: 1rem;
    color: #27272a;
    font-family: inherit;
}

.drawer-body-container {
    font-family: inherit;
}

.drawer-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.grid-2-cols {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

@media (min-width: 768px) {
    .grid-2-cols {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

.btn-group-right {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.5rem;
}

.btn-cancel {
    border-radius: 0.5rem !important;
}

.btn-submit {
    border-radius: 0.5rem !important;
    background-color: #1f5ca9 !important;
    border: none !important;
    color: #ffffff !important;
    font-weight: 600 !important;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-submit:hover {
    background-color: #1a4e8f !important;
}
`;

export default DrawerBieuMauLichSu;
