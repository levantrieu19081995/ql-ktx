"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Stack,
  Group,
  Text,
  TextInput,
  Button,
  Select,
  MultiSelect,
  FileInput,
  SegmentedControl,
  SimpleGrid,
} from "@mantine/core";
import { dichVuCamera, KhuVucCamera, NhomNguoi } from "@/services/camera/cameraService";
import { showNoti } from "@/components/common/showNoti";

const TOI_DA_ANH = 20;
const TOI_DA_BYTE = 200 * 1024 * 1024; // khớp giới hạn của proxy

interface Props {
  opened: boolean;
  onClose: () => void;
  onDone?: () => void;
}

/** Lấy mẫu người mới (POST /api/people): mã, tên, nhóm, khu vực, và ảnh (tối đa 20) hoặc video. */
export default function ModalLayMauNguoi({ opened, onClose, onDone }: Props) {
  const [maSo, setMaSo] = useState("");
  const [ten, setTen] = useState("");
  const [nhom, setNhom] = useState<string | null>(null);
  const [khuVuc, setKhuVuc] = useState<string[]>([]);
  // new: người mới (POST /api/people); add: bổ sung ảnh cho người đã có (POST /api/people/{id}/photos)
  const [loaiLay, setLoaiLay] = useState<"new" | "add">("new");
  const [cheDo, setCheDo] = useState<"photos" | "video">("photos");
  const [anh, setAnh] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [dangGui, setDangGui] = useState(false);

  const [dsNhom, setDsNhom] = useState<NhomNguoi[]>([]);
  const [dsKhuVuc, setDsKhuVuc] = useState<KhuVucCamera[]>([]);

  // nạp danh mục khi mở form
  useEffect(() => {
    if (!opened) return;
    const ctrl = new AbortController();
    dichVuCamera.layNhom(ctrl.signal).then(setDsNhom).catch(() => setDsNhom([]));
    dichVuCamera.layKhuVuc(ctrl.signal).then(setDsKhuVuc).catch(() => setDsKhuVuc([]));
    return () => ctrl.abort();
  }, [opened]);

  const datLai = () => {
    setMaSo("");
    setTen("");
    setNhom(null);
    setKhuVuc([]);
    setLoaiLay("new");
    setCheDo("photos");
    setAnh([]);
    setVideo(null);
  };

  const optionsNhom = useMemo(
    () => dsNhom.map((g) => ({ value: String(g.id), label: g.name })),
    [dsNhom],
  );
  const optionsKhuVuc = useMemo(
    () => dsKhuVuc.map((a) => ({ value: String(a.id), label: a.name })),
    [dsKhuVuc],
  );

  const tongByte = cheDo === "video" ? (video?.size ?? 0) : anh.reduce((s, f) => s + f.size, 0);

  const loiForm = (() => {
    if (!maSo.trim()) return "Nhập mã số";
    if (loaiLay === "new" && !ten.trim()) return "Nhập tên";
    if (cheDo === "photos") {
      if (anh.length === 0) return "Chọn ít nhất 1 ảnh khuôn mặt";
      if (anh.length > TOI_DA_ANH) return `Tối đa ${TOI_DA_ANH} ảnh`;
    } else if (!video) {
      return "Chọn video lấy mẫu";
    }
    if (tongByte > TOI_DA_BYTE) return "Dung lượng quá lớn (tối đa 200MB)";
    return null;
  })();

  const gui = async () => {
    if (loiForm) return;
    setDangGui(true);
    try {
      if (loaiLay === "new") {
        await dichVuCamera.dangKyNguoi({
          id: maSo.trim(),
          name: ten.trim(),
          groupId: nhom ?? undefined,
          areaIds: khuVuc,
          photos: cheDo === "photos" ? anh : [],
          video: cheDo === "video" ? video : null,
        });
        showNoti("success", `Đã lấy mẫu cho ${ten.trim()} (${maSo.trim()})`);
      } else {
        await dichVuCamera.themAnhChoNguoi(
          maSo.trim(),
          cheDo === "photos" ? anh : [],
          cheDo === "video" ? video : null,
        );
        showNoti("success", `Đã bổ sung ảnh cho ${maSo.trim()}`);
      }
      datLai();
      onDone?.();
      onClose();
    } catch (e) {
      showNoti("error", e instanceof Error ? e.message : "Không lấy mẫu được");
    } finally {
      setDangGui(false);
    }
  };

  const dong = () => {
    if (dangGui) return;
    onClose();
  };

  return (
    <Modal opened={opened} onClose={dong} title="Lấy mẫu khuôn mặt" centered size="md">
      <Stack gap="sm">
        <SegmentedControl
          size="xs"
          value={loaiLay}
          onChange={(v) => setLoaiLay(v as "new" | "add")}
          data={[
            { value: "new", label: "Người mới" },
            { value: "add", label: "Thêm ảnh cho người đã có" },
          ]}
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <TextInput
            label="Mã số"
            placeholder="MSSV / mã cán bộ"
            required
            value={maSo}
            onChange={(e) => setMaSo(e.currentTarget.value)}
          />
          {/* Thêm ảnh cho người đã có thì chỉ cần mã số, các thông tin còn lại đã có sẵn */}
          {loaiLay === "new" && (
            <>
              <TextInput
                label="Họ tên"
                required
                value={ten}
                onChange={(e) => setTen(e.currentTarget.value)}
              />
              <Select
                label="Nhóm"
                placeholder="Chọn nhóm"
                data={optionsNhom}
                value={nhom}
                onChange={setNhom}
                clearable
              />
              <MultiSelect
                label="Khu vực"
                placeholder="Chọn khu vực"
                data={optionsKhuVuc}
                value={khuVuc}
                onChange={setKhuVuc}
              />
            </>
          )}
        </SimpleGrid>

        <SegmentedControl
          size="xs"
          value={cheDo}
          onChange={(v) => setCheDo(v as "photos" | "video")}
          data={[
            { value: "photos", label: `Ảnh (tối đa ${TOI_DA_ANH})` },
            { value: "video", label: "Video" },
          ]}
        />

        {cheDo === "photos" ? (
          <FileInput
            label="Ảnh khuôn mặt"
            placeholder="Chọn ảnh"
            accept="image/*"
            multiple
            clearable
            value={anh}
            onChange={(f) => setAnh(f.slice(0, TOI_DA_ANH))}
            description={
              anh.length > 0
                ? `${anh.length}/${TOI_DA_ANH} ảnh, ${(tongByte / 1024 / 1024).toFixed(1)} MB`
                : "Nên chọn ảnh rõ mặt, nhiều góc"
            }
          />
        ) : (
          <FileInput
            label="Video lấy mẫu"
            placeholder="Chọn video"
            accept="video/*"
            clearable
            value={video}
            onChange={setVideo}
            description={video ? `${(video.size / 1024 / 1024).toFixed(1)} MB` : undefined}
          />
        )}

        {loiForm && (maSo || ten || anh.length > 0 || video) && (
          <Text c="orange" fz="xs">
            {loiForm}
          </Text>
        )}

        <Group justify="flex-end" mt="xs">
          <Button variant="default" size="xs" onClick={dong} disabled={dangGui}>
            Huỷ
          </Button>
          <Button size="xs" onClick={gui} loading={dangGui} disabled={!!loiForm}>
            {loaiLay === "new" ? "Lấy mẫu" : "Thêm ảnh"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
