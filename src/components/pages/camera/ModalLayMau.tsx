"use client";

import React, { useEffect, useState } from "react";
import { Modal, Stack, Group, Text, TextInput, Button, Badge } from "@mantine/core";
import dayjs from "dayjs";
import { UnknownRecord, dichVuCamera } from "@/services/camera/cameraService";
import { showNoti } from "@/components/common/showNoti";

interface Props {
  record: UnknownRecord | null;
  onClose: () => void;
  onDone: () => void;
}

const phanTram = (v?: number) =>
  typeof v === "number" ? `${Math.round(v * 100)}%` : "—";

/** Lấy mẫu: gán khuôn mặt lạ vào mẫu của một người, có xem trước độ giống. */
export default function ModalLayMau({ record, onClose, onDone }: Props) {
  const [personId, setPersonId] = useState("");
  const [doGiong, setDoGiong] = useState<{ value: number; can: number } | null>(null);
  const [loiDoGiong, setLoiDoGiong] = useState<string | null>(null);
  const [dangKiemTra, setDangKiemTra] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);

  // mở bản ghi mới → đặt lại và gợi ý sẵn người "có thể là"
  useEffect(() => {
    setPersonId(record?.guess?.person?.id ?? "");
    setDoGiong(null);
    setLoiDoGiong(null);
  }, [record]);

  if (!record) return null;

  const id = personId.trim();

  const kiemTra = async () => {
    if (!id) return;
    setDangKiemTra(true);
    setLoiDoGiong(null);
    setDoGiong(null);
    try {
      const r = await dichVuCamera.layDoGiong(record.id, id);
      setDoGiong({ value: r.similarity, can: r.recognition_needs });
    } catch (e) {
      setLoiDoGiong(e instanceof Error ? e.message : "Không kiểm tra được");
    } finally {
      setDangKiemTra(false);
    }
  };

  const luu = async () => {
    if (!id) return;
    setDangLuu(true);
    try {
      await dichVuCamera.themMau(record.id, id);
      showNoti("success", `Đã cập nhật mẫu cho ${id}`);
      onDone();
      onClose();
    } catch (e) {
      showNoti("error", e instanceof Error ? e.message : "Không thêm được mẫu");
    } finally {
      setDangLuu(false);
    }
  };

  const duDieuKien = doGiong ? doGiong.value >= doGiong.can : null;

  return (
    <Modal opened onClose={onClose} title="Cập nhật mẫu từ camera" centered size="sm">
      <Stack gap="sm">
        {record.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dichVuCamera.urlAnh(record.image)}
            alt=""
            style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, alignSelf: "center" }}
          />
        )}
        <Text fz="xs" c="dimmed" ta="center">
          {dayjs(record.time).format("DD/MM/YYYY HH:mm:ss")} · {record.camera?.name}
        </Text>

        <TextInput
          label="Mã người (MSSV / mã cán bộ)"
          placeholder="Ví dụ B2302221"
          value={personId}
          onChange={(e) => {
            setPersonId(e.currentTarget.value);
            setDoGiong(null);
            setLoiDoGiong(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") kiemTra();
          }}
          description={
            record.guess?.person
              ? `Gợi ý: ${record.guess.person.name} (${record.guess.person.id}), tương đồng ${phanTram(record.guess.similarity)}`
              : undefined
          }
          data-autofocus
        />

        <Group justify="space-between" align="center">
          <Button size="xs" variant="light" onClick={kiemTra} loading={dangKiemTra} disabled={!id}>
            Kiểm tra độ giống
          </Button>
          {doGiong && (
            <Badge color={duDieuKien ? "green" : "orange"} variant="light">
              Giống {phanTram(doGiong.value)} (cần ≥ {phanTram(doGiong.can)})
            </Badge>
          )}
          {loiDoGiong && (
            <Text c="red" fz="xs">
              {loiDoGiong}
            </Text>
          )}
        </Group>

        {doGiong && !duDieuKien && (
          <Text c="orange" fz="xs">
            Độ giống thấp hơn ngưỡng nhận diện. Hãy chắc chắn đúng người trước khi thêm mẫu.
          </Text>
        )}

        <Group justify="flex-end" mt="xs">
          <Button variant="default" size="xs" onClick={onClose}>
            Huỷ
          </Button>
          <Button size="xs" onClick={luu} loading={dangLuu} disabled={!id}>
            Thêm mẫu
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
