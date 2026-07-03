/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import {
  IconAdOff,
  IconDeviceFloppy,
  IconLockFilled,
  IconSearch,
} from "@tabler/icons-react";

import DanhMucFeaturePage from "./DanhMucFeaturePage";
import CustomPagination from "@/components/common/CustomPagination";
import {
  createSinhVienBiCam,
  fetchChiTietSinhVienBiCam,
  fetchDanhSachLoaiSuKienKtx,
  fetchDanhSachSinhVienBiCam,
  fetchDanhSachSinhVienKtx,
  updateSinhVienBiCam,
} from "@/services/danh-muc/danhMucKtxService";

export default function SinhVienBiCamPage() {
  const [items, setItems] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [maSinhVienSearch, setMaSinhVienSearch] = useState("");
  const [opened, setOpened] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | string | null>(null);

  const [form, setForm] = useState({
    maSinhVien: "",
    lyDo: "",
    ngayBatDau: "",
    ngayKetThuc: "",
    loaiSuKienId: "-1",
  });

  const [loaiSuKienOptions, setLoaiSuKienOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [sinhVienOptions, setSinhVienOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const loadLoaiSuKienOptions = async () => {
    const res = await fetchDanhSachLoaiSuKienKtx({ page: 1, pageSize: 20 });

    setLoaiSuKienOptions(
      (res?.items || [])
        .filter((item: any) => item.trangThai === "ACTIVE")
        .map((item: any) => ({
          value: String(item.loaiSuKienId),
          label: `${item.tenLoai} (${item.maLoai})`,
        })),
    );
  };

  const loadSinhVienOptions = async (keyword = "") => {
    try {
      const res = await fetchDanhSachSinhVienKtx({
        page: 1,
        pageSize: 20,
        keyword,
      });

      setSinhVienOptions(
        (res?.items || []).map((item: any) => ({
          value: item.maSinhVien,
          label: `${item.maSinhVien} - ${item.hoTen || ""}${
            item.maPhong ? ` - Phòng ${item.maPhong}` : ""
          }`,
        })),
      );
    } catch (error) {
      console.error("Lỗi lấy danh sách sinh viên:", error);
      setSinhVienOptions([]);
    }
  };

  const formatDateMMDDYYYY = (value?: string) => {
    if (!value) return undefined;

    const date = new Date(value);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  };

  const formatDateTimeLocal = (value?: number | string | null) => {
    if (!value) return "";

    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);

    return localDate.toISOString().slice(0, 16);
  };

  const handleAdd = () => {
    loadSinhVienOptions();
    loadLoaiSuKienOptions();
    setForm({
      maSinhVien: "",
      lyDo: "",
      ngayBatDau: "",
      ngayKetThuc: "",
      loaiSuKienId: "-1",
    });

    setOpened(true);
  };

  const handleEdit = async (item: any) => {
    loadSinhVienOptions();
    loadLoaiSuKienOptions();
    try {
      const id = item.camId;
      const detail = await fetchChiTietSinhVienBiCam(id);

      setMode("edit");
      setEditingId(id);

      setForm({
        maSinhVien: detail.maSinhVien || "",
        lyDo: detail.lyDo || "",
        ngayBatDau: formatDateTimeLocal(detail.ngayBatDau as any),
        ngayKetThuc: formatDateTimeLocal(detail.ngayKetThuc as any),
        loaiSuKienId: String(detail.loaiSuKienId ?? "-1"),
      });

      setOpened(true);
    } catch (error) {
      console.error("Lỗi lấy chi tiết sinh viên bị cấm:", error);
    }
  };

  const loadData = async (pageValue = page, pageSizeValue = pageSize) => {
    try {
      const res = await fetchDanhSachSinhVienBiCam({
        page: pageValue,
        pageSize: pageSizeValue,
        maSinhVien: maSinhVienSearch.trim() || "-1",
      });

      setItems(res?.items || []);
      setTotalItems(res?.totalElements || 0);
      setTotalPages(res?.totalPages || 0);
    } catch (error) {
      console.error("Lỗi lấy danh sách sinh viên bị cấm:", error);
      setItems([]);
      setTotalItems(0);
      setTotalPages(0);
    }
  };

  const getInputValue = (event: any) => {
    return event?.currentTarget?.value ?? event?.target?.value ?? "";
  };

  const handleChangeForm = (field: keyof typeof form) => (event: any) => {
    const value = getInputValue(event);

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    setPage(1);
    loadData(1, pageSize);
  };

  const handleSave = async () => {
    try {
      const payload = {
        sinhVienId: -1,
        maSinhVien: form.maSinhVien,
        lyDo: form.lyDo,
        ngayBatDau: formatDateMMDDYYYY(form.ngayBatDau),
        ngayKetThuc: form.ngayKetThuc
          ? formatDateMMDDYYYY(form.ngayKetThuc)
          : null,
        loaiSuKienId: Number(form.loaiSuKienId) || -1,
      };

      if (mode === "edit" && editingId) {
        await updateSinhVienBiCam(editingId, payload);
      } else {
        await createSinhVienBiCam(payload);
      }

      setOpened(false);
      setPage(1);
      loadData(1, pageSize);
    } catch (error) {
      console.error("Lỗi lưu sinh viên bị cấm:", error);
    }
  };

  useEffect(() => {
    loadData(1, pageSize);
  }, []);

  return (
    <>
      <DanhMucFeaturePage
        type="sinhVienBiCam"
        title="Lấy danh sách sinh viên bị cấm"
        description="Theo dõi danh sách sinh viên bị cấm ra vào ký túc xá."
        items={items}
        onEdit={handleEdit}
        icon={<IconLockFilled size={20} />}
        searchControls={
          <>
            <TextInput
              label="Mã sinh viên"
              placeholder="Nhập mã sinh viên..."
              flex={1}
              value={maSinhVienSearch}
              onChange={(event) =>
                setMaSinhVienSearch(event.currentTarget.value)
              }
            />

            <Button
              mt={25}
              leftSection={<IconSearch size={18} />}
              color="blue"
              radius="md"
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>

            <Button
              mt={25}
              leftSection={<IconAdOff size={18} />}
              color="blue"
              radius="md"
              onClick={handleAdd}
            >
              Thêm sinh viên
            </Button>
          </>
        }
        pagination={
          <CustomPagination
            totalItems={totalItems}
            totalPages={totalPages}
            page={page}
            pageSize={pageSize}
            setPage={setPage}
            setPageSize={setPageSize}
            fetchData={loadData}
          />
        }
      />

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          mode === "edit" ? "Sửa sinh viên bị cấm" : "Thêm sinh viên bị cấm"
        }
        position="right"
        size="lg"
      >
        <Stack gap="md">
          <Select
            label="Mã sinh viên"
            placeholder="Tìm mã sinh viên / họ tên"
            data={sinhVienOptions}
            value={form.maSinhVien || null}
            searchable
            clearable
            nothingFoundMessage="Không tìm thấy sinh viên"
            onSearchChange={loadSinhVienOptions}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                maSinhVien: value || "",
              }))
            }
            flex={1}
          />

          <Textarea
            label="Lý do cấm"
            placeholder="Nhập lý do cấm"
            minRows={4}
            value={form.lyDo}
            onChange={handleChangeForm("lyDo")}
          />

          <TextInput
            label="Ngày bắt đầu"
            type="datetime-local"
            value={form.ngayBatDau}
            onChange={handleChangeForm("ngayBatDau")}
          />

          <TextInput
            label="Ngày kết thúc"
            type="datetime-local"
            value={form.ngayKetThuc}
            onChange={handleChangeForm("ngayKetThuc")}
          />

          <Select
            label="Loại sự kiện"
            placeholder="Chọn loại sự kiện"
            data={loaiSuKienOptions}
            value={form.loaiSuKienId === "-1" ? null : form.loaiSuKienId}
            searchable
            clearable
            nothingFoundMessage="Không tìm thấy loại sự kiện"
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                loaiSuKienId: value || "-1",
              }))
            }
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setOpened(false)}>
              Hủy
            </Button>

            <Button
              color="blue"
              leftSection={<IconDeviceFloppy size={18} />}
              onClick={handleSave}
            >
              {mode === "edit" ? "Cập nhật" : "Lưu"}
            </Button>
          </Group>
        </Stack>
      </Drawer>
    </>
  );
}
