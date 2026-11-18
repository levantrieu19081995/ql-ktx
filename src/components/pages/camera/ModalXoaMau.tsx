"use client";

import React, { useEffect, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconAlertTriangle, IconSearch, IconTrash } from "@tabler/icons-react";
import { ThongTinMau, dichVuCamera } from "@/services/camera/cameraService";
import { showNoti } from "@/components/common/showNoti";

interface Props {
  opened: boolean;
  onClose: () => void;
  /** Gọi sau khi xóa thành công (để làm mới danh sách bên ngoài). */
  onDone?: () => void;
}

/**
 * Xóa dữ liệu khuôn mặt của một người:
 *  - GET    /api/people/{id}              tra cứu thông tin và số ảnh mẫu
 *  - DELETE /api/people/{id}/photos/{pid} xóa từng ảnh mẫu
 *  - DELETE /api/people/{id}              xóa người và toàn bộ ảnh mẫu
 * Mọi thao tác xóa đều không hoàn tác nên luôn có bước xác nhận.
 */
export default function ModalXoaMau({ opened, onClose, onDone }: Props) {
  const [maSo, setMaSo] = useState("");
  const [dangTim, setDangTim] = useState(false);
  const [dangXoa, setDangXoa] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [thongTin, setThongTin] = useState<ThongTinMau | null>(null);
  // Mục đang chờ xác nhận xóa: "ALL" (toàn bộ) hoặc id ảnh
  const [choXacNhan, setChoXacNhan] = useState<string | null>(null);

  useEffect(() => {
    if (opened) return;
    setMaSo("");
    setThongTin(null);
    setLoi(null);
    setChoXacNhan(null);
  }, [opened]);

  const traCuu = async (ma = maSo) => {
    const id = ma.trim();
    if (!id) {
      setLoi("Nhập mã số cần tra cứu");
      return;
    }
    setDangTim(true);
    setLoi(null);
    setThongTin(null);
    setChoXacNhan(null);
    try {
      setThongTin(await dichVuCamera.layThongTinNguoi(id));
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không tra cứu được");
    } finally {
      setDangTim(false);
    }
  };

  const xoaToanBo = async () => {
    if (!thongTin) return;
    setDangXoa(true);
    try {
      await dichVuCamera.xoaNguoi(thongTin.id);
      showNoti("success", `Đã xóa dữ liệu khuôn mặt của ${thongTin.ten || thongTin.id}`);
      onDone?.();
      onClose();
    } catch (e) {
      showNoti("error", e instanceof Error ? e.message : "Xóa thất bại");
    } finally {
      setDangXoa(false);
      setChoXacNhan(null);
    }
  };

  const xoaMotAnh = async (photoId: string) => {
    if (!thongTin) return;
    setDangXoa(true);
    try {
      await dichVuCamera.xoaAnhNguoi(thongTin.id, photoId);
      showNoti("success", "Đã xóa ảnh mẫu");
      onDone?.();
      // Tải lại để số ảnh và danh sách luôn đúng với BE
      setChoXacNhan(null);
      try {
        setThongTin(await dichVuCamera.layThongTinNguoi(thongTin.id));
      } catch {
        setThongTin(null);
        setLoi("Đã xóa ảnh. Tra cứu lại để xem danh sách mới.");
      }
    } catch (e) {
      showNoti("error", e instanceof Error ? e.message : "Xóa ảnh thất bại");
    } finally {
      setDangXoa(false);
      setChoXacNhan(null);
    }
  };

  const coDanhSachAnh = !!thongTin && thongTin.anh.length > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Xóa dữ liệu khuôn mặt"
      size="lg"
      centered
      closeOnClickOutside={!dangXoa}
    >
      <Stack gap="md">
        <Group align="end" gap="sm" wrap="nowrap">
          <TextInput
            label="Mã số"
            placeholder="Ví dụ: B2509762"
            value={maSo}
            onChange={(e) => setMaSo(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && traCuu()}
            style={{ flex: 1 }}
            data-autofocus
          />
          <Button
            leftSection={dangTim ? <Loader size={14} color="white" /> : <IconSearch size={16} />}
            onClick={() => traCuu()}
            disabled={dangTim || dangXoa}
          >
            Tra cứu
          </Button>
        </Group>

        {loi && (
          <Alert color="red" variant="light">
            {loi}
          </Alert>
        )}

        {thongTin && (
          <Stack gap="sm">
            <Paper withBorder p="sm" radius="md">
              <Group justify="space-between" wrap="nowrap">
                <div>
                  <Text fw={700}>{thongTin.ten || "(không có tên)"}</Text>
                  <Text size="sm" c="dimmed">
                    Mã số: {thongTin.id}
                  </Text>
                </div>
                <Badge size="lg" variant="light" color={thongTin.soAnh > 0 ? "blue" : "gray"}>
                  {thongTin.soAnh} ảnh mẫu
                </Badge>
              </Group>
            </Paper>

            {coDanhSachAnh ? (
              <SimpleGrid cols={{ base: 3, sm: 4 }} spacing="xs">
                {thongTin.anh.map((a) => (
                  <Paper key={a.id} withBorder radius="md" p={4} style={{ position: "relative" }}>
                    {a.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={dichVuCamera.urlAnh(a.url)}
                        alt={a.id}
                        style={{
                          width: "100%",
                          aspectRatio: "1",
                          objectFit: "cover",
                          borderRadius: 6,
                          display: "block",
                        }}
                      />
                    ) : (
                      <Text size="xs" c="dimmed" ta="center" py="lg" style={{ wordBreak: "break-all" }}>
                        {a.id}
                      </Text>
                    )}
                    <Tooltip label="Xóa ảnh này">
                      <ActionIcon
                        color="red"
                        variant="filled"
                        size="sm"
                        radius="xl"
                        aria-label="Xóa ảnh"
                        disabled={dangXoa}
                        onClick={() => setChoXacNhan(a.id)}
                        style={{ position: "absolute", top: 6, right: 6 }}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Paper>
                ))}
              </SimpleGrid>
            ) : (
              thongTin.soAnh > 0 && (
                <Text size="xs" c="dimmed">
                  Hệ thống chỉ trả số lượng ảnh, chưa trả danh sách từng ảnh nên chỉ có thể xóa toàn bộ.
                </Text>
              )
            )}

            {choXacNhan && choXacNhan !== "ALL" && (
              <Alert color="orange" variant="light" icon={<IconAlertTriangle size={18} />}>
                <Text size="sm" mb="xs">
                  Xóa ảnh mẫu <b>{choXacNhan}</b>? Không thể hoàn tác.
                </Text>
                <Group gap="xs">
                  <Button size="xs" color="red" loading={dangXoa} onClick={() => xoaMotAnh(choXacNhan)}>
                    Xác nhận xóa ảnh
                  </Button>
                  <Button size="xs" variant="default" disabled={dangXoa} onClick={() => setChoXacNhan(null)}>
                    Hủy
                  </Button>
                </Group>
              </Alert>
            )}

            {choXacNhan === "ALL" ? (
              <Alert color="red" variant="light" icon={<IconAlertTriangle size={18} />}>
                <Text size="sm" mb="xs">
                  Xóa toàn bộ thông tin và <b>{thongTin.soAnh} ảnh mẫu</b> của{" "}
                  <b>{thongTin.ten || thongTin.id}</b> ({thongTin.id})? Người này sẽ không còn được nhận diện và
                  thao tác này không thể hoàn tác.
                </Text>
                <Group gap="xs">
                  <Button size="xs" color="red" loading={dangXoa} onClick={xoaToanBo}>
                    Xác nhận xóa toàn bộ
                  </Button>
                  <Button size="xs" variant="default" disabled={dangXoa} onClick={() => setChoXacNhan(null)}>
                    Hủy
                  </Button>
                </Group>
              </Alert>
            ) : (
              <Group justify="flex-end">
                <Button
                  color="red"
                  variant="light"
                  leftSection={<IconTrash size={16} />}
                  disabled={dangXoa}
                  onClick={() => setChoXacNhan("ALL")}
                >
                  Xóa toàn bộ dữ liệu khuôn mặt
                </Button>
              </Group>
            )}
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}
