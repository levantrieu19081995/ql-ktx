"use client";
// Popup cảnh báo realtime cho bảo vệ: nghi giả mạo, người lạ, sinh viên bị cấm, sinh viên nợ phí.
// Nguồn: luồng sự kiện nhận diện (useSuKienTrucTiep). Chỉ báo sự kiện xảy ra SAU khi trang mở / sau khi bật,
// mỗi đối tượng báo lại tối thiểu sau COOLDOWN_MS để không dồn thông báo khi một người đứng lâu trước camera.
import React, { useEffect, useRef } from "react";
import { Group, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconAlertTriangle,
  IconBan,
  IconCurrencyDong,
  IconUserQuestion,
} from "@tabler/icons-react";
import { SuKienTrucTiep, dichVuCamera } from "@/services/camera/cameraService";

const COOLDOWN_MS = 30_000;
const TU_DONG_DONG_MS = 10_000;

type Loai = "spoof" | "stranger" | "banned" | "debt";

const CAU_HINH: Record<
  Loai,
  { tieuDe: string; mau: string; icon: React.ReactNode }
> = {
  spoof: {
    tieuDe: "Nghi giả mạo khuôn mặt",
    mau: "red",
    icon: <IconAlertTriangle size={20} />,
  },
  banned: {
    tieuDe: "Sinh viên bị cấm ra vào",
    mau: "red",
    icon: <IconBan size={20} />,
  },
  stranger: {
    tieuDe: "Phát hiện người lạ",
    mau: "orange",
    icon: <IconUserQuestion size={20} />,
  },
  debt: {
    tieuDe: "Sinh viên nợ phí",
    mau: "yellow",
    icon: <IconCurrencyDong size={20} />,
  },
};

function phanLoai(e: SuKienTrucTiep): Loai | null {
  if (e.type === "spoof") return "spoof";
  if (e.type === "unknown") return "stranger";
  if (e.type === "recognized" && e.person) {
    if (e.ban?.allowed === false) return "banned";
    if ((e.ban?.debt ?? 0) > 0) return "debt";
  }
  return null;
}

function anhCuaSuKien(e: SuKienTrucTiep): string {
  if (e.face_image) return `data:image/jpeg;base64,${e.face_image}`;
  if (e.body_image) return `data:image/jpeg;base64,${e.body_image}`;
  return e.image_path ? dichVuCamera.urlAnhTheoDuongDan(e.image_path) : "";
}

export function useCanhBaoPopup(
  suKien: SuKienTrucTiep[],
  bat: boolean,
  khiBam?: () => void,
) {
  const daBao = useRef(new Set<string>());
  const lanCuoi = useRef(new Map<string, number>());
  const batTu = useRef(Date.now());
  const khiBamRef = useRef(khiBam);
  khiBamRef.current = khiBam;

  // Bật lại thì chỉ báo các sự kiện mới từ lúc bật
  useEffect(() => {
    if (bat) batTu.current = Date.now();
  }, [bat]);

  useEffect(() => {
    if (!bat) return;
    // suKien: mới nhất đứng đầu → duyệt từ cũ đến mới để popup theo đúng thứ tự
    for (let i = suKien.length - 1; i >= 0; i--) {
      const e = suKien[i];
      if ((e.nhanLuc ?? 0) < batTu.current) continue;
      const loai = phanLoai(e);
      if (!loai) continue;

      const khoaSuKien = `${e.seq}:${loai}`;
      if (daBao.current.has(khoaSuKien)) continue;
      daBao.current.add(khoaSuKien);

      const doiTuong = e.person?.id ?? e.track ?? `cam${e.camera?.index}`;
      const khoaDoiTuong = `${loai}:${doiTuong}`;
      const bayGio = Date.now();
      if (bayGio - (lanCuoi.current.get(khoaDoiTuong) ?? 0) < COOLDOWN_MS) continue;
      lanCuoi.current.set(khoaDoiTuong, bayGio);

      const ch = CAU_HINH[loai];
      const anh = anhCuaSuKien(e);
      const ten = e.ban?.full_name?.trim() || e.person?.name;
      const camera = e.camera?.name || `Camera ${e.camera?.index ?? ""}`;
      const chiTiet =
        loai === "banned"
          ? e.ban?.reasons?.filter(Boolean).join("; ") || "Thuộc danh sách cấm"
          : loai === "debt"
            ? `Nợ ${Number(e.ban?.debt).toLocaleString("vi-VN")} đ`
            : loai === "spoof"
              ? "Phát hiện dấu hiệu dùng ảnh hoặc video thay người thật"
              : "Không có trong danh sách sinh viên";

      notifications.show({
        id: `canh-bao-${khoaSuKien}`,
        color: ch.mau,
        icon: ch.icon,
        title: ch.tieuDe,
        autoClose: TU_DONG_DONG_MS,
        withBorder: true,
        styles: {
          root: { cursor: "pointer", borderLeft: `4px solid var(--mantine-color-${ch.mau}-filled)` },
          title: { fontWeight: 700 },
        },
        onClick: () => khiBamRef.current?.(),
        message: (
          <Group gap="sm" wrap="nowrap" align="flex-start">
            {anh && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={anh}
                alt=""
                width={56}
                height={56}
                style={{ borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
              />
            )}
            <Stack gap={2} style={{ minWidth: 0 }}>
              {ten && (
                <Text size="sm" fw={600} lh={1.3}>
                  {ten}
                  {e.person?.id ? ` (${e.person.id})` : ""}
                </Text>
              )}
              <Text size="xs" c="dimmed" lh={1.3}>
                {chiTiet}
              </Text>
              <Text size="xs" c="dimmed" lh={1.3}>
                {camera}
              </Text>
            </Stack>
          </Group>
        ),
      });
    }
  }, [suKien, bat]);
}
