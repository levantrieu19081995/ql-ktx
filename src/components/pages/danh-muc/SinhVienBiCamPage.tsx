/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { DateInput } from "@mantine/dates";
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
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";

import DanhMucFeaturePage from "./DanhMucFeaturePage";
import CustomPagination from "@/components/common/CustomPagination";
import { showNoti } from "@/components/common/showNoti";
import {
  createSinhVienBiCam,
  fetchChiTietSinhVienBiCam,
  fetchDanhSachLoaiSuKienKtx,
  fetchDanhSachSinhVienBiCam,
  fetchDanhSachSinhVienKtx,
  updateSinhVienBiCam,
} from "@/services/danh-muc/danhMucKtxService";

type FormErrors = {
  maSinhVien?: string;
  lyDo?: string;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  loaiSuKienId?: string;
};

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
    sinhVienId: "-1",
    lyDo: "",
    ngayBatDau: "",
    ngayKetThuc: "",
    loaiSuKienId: "-1",
  });

  // bổ sung cho validate
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const [sinhVienList, setSinhVienList] = useState<any[]>([]);

  const [loaiSuKienOptions, setLoaiSuKienOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [sinhVienOptions, setSinhVienOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const resetFormState = () => {
    setMode("create");
    setEditingId(null);
    setForm({
      maSinhVien: "",
      sinhVienId: "-1",
      lyDo: "",
      ngayBatDau: "",
      ngayKetThuc: "",
      loaiSuKienId: "-1",
    });
    setFormErrors({});
  };

  const handleCloseForm = () => {
    setOpened(false);
    resetFormState();
  };

  const loadLoaiSuKienOptions = async () => {
    const res = await fetchDanhSachLoaiSuKienKtx({ page: 1, pageSize: 20 });

    setLoaiSuKienOptions(
      (res?.items || [])
        .filter((item: any) => item.trangThai === "ACTIVE")
        .map((item: any) => ({
          value: String(item.loaiSuKienId),
          // label: `${item.tenLoai} (${item.maLoai})`,
          label: item.tenLoai,
        })),
    );
  };

  const loadSinhVienOptions = async (keyword = ""): Promise<any[]> => {
    try {
      let res = await fetchDanhSachSinhVienKtx({
        page: 1,
        pageSize: 99999,
        maSinhVien: keyword.trim() || undefined,
      });
      if (!res?.items || res.items.length === 0) {
        res = await fetchDanhSachSinhVienKtx({
          page: 1,
          pageSize: 99999,
          hoTen: keyword.trim() || undefined,
        });
      }

      // const rawItems = res?.items || [];
      // setSinhVienList(rawItems);

      // setSinhVienOptions(
      //   rawItems.map((item: any) => ({
      //     value: item.maSinhVien,
      //     label: `${item.maSinhVien} - ${item.hoTen || ""}${
      //       item.maPhong ? ` - Phòng ${item.maPhong}` : ""
      //     }`,
      //   })),
      // );

      const rawItems = res?.items || [];

      const uniqueStudents = Array.from(
        new Map(
          rawItems
            .filter((item: any) => String(item.maSinhVien || "").trim())
            .map((item: any) => [String(item.maSinhVien).trim(), item]),
        ).values(),
      );

      setSinhVienList(uniqueStudents);

      setSinhVienOptions(
        uniqueStudents.map((item: any) => ({
          value: String(item.maSinhVien).trim(),
          label: `${item.maSinhVien} - ${item.hoTen || ""}${
            item.maPhong ? ` - Phòng ${item.maPhong}` : ""
          }`,
        })),
      );

      return uniqueStudents;
    } catch (error) {
      console.error("Lỗi lấy danh sách sinh viên:", error);
      setSinhVienOptions([]);
      setSinhVienList([]);
      return [];
    }
  };

  const formatDateMMDDYYYY = (value?: string) => {
    if (!value) return undefined;

    const date = parseDateTimeValue(value);
    if (Number.isNaN(date.getTime())) return undefined;

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  };

  const formatDateInputValue = (value?: number | string | null) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleAdd = () => {
    resetFormState();

    loadSinhVienOptions();
    loadLoaiSuKienOptions();

    setOpened(true);
  };

  const handleEdit = async (item: any) => {
    try {
      const id = item.camId;
      const detail = await fetchChiTietSinhVienBiCam(id);
      const selectedMaSinhVien = String(
        detail.maSinhVien || item.maSinhVien || "",
      ).trim();

      const [loadedStudents] = await Promise.all([
        loadSinhVienOptions(selectedMaSinhVien),
        loadLoaiSuKienOptions(),
      ]);
      const selectedStudent = loadedStudents.find(
        (student) =>
          String(student.maSinhVien || "").trim() === selectedMaSinhVien,
      );
      const selectedSinhVienId =
        detail.sinhVienId ??
        item.sinhVienId ??
        selectedStudent?.sinhVienId ??
        selectedStudent?.id;

      if (selectedMaSinhVien) {
        setSinhVienOptions((currentOptions) =>
          currentOptions.some((option) => option.value === selectedMaSinhVien)
            ? currentOptions
            : [
                {
                  value: selectedMaSinhVien,
                  label: selectedMaSinhVien,
                },
                ...currentOptions,
              ],
        );
        setSinhVienList((currentStudents) =>
          currentStudents.some(
            (student) =>
              String(student.maSinhVien || "").trim() === selectedMaSinhVien,
          )
            ? currentStudents
            : [
                {
                  maSinhVien: selectedMaSinhVien,
                  sinhVienId: selectedSinhVienId,
                },
                ...currentStudents,
              ],
        );
      }

      setMode("edit");
      setEditingId(id);

      setForm({
        maSinhVien: selectedMaSinhVien,
        sinhVienId: String(selectedSinhVienId ?? "-1"),
        lyDo: detail.lyDo || "",
        ngayBatDau: formatDateInputValue(detail.ngayBatDau as any),
        ngayKetThuc: formatDateInputValue(detail.ngayKetThuc as any),
        loaiSuKienId: String(detail.loaiSuKienId ?? "-1"),
      });

      setOpened(true);

      // Bo sung validate
      setFormErrors({});
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

  const handleReset = async () => {
    setMaSinhVienSearch("");
    setPage(1);

    try {
      const res = await fetchDanhSachSinhVienBiCam({
        page: 1,
        pageSize: pageSize,
        maSinhVien: "-1",
      });

      setItems(res?.items || []);
      setTotalItems(res?.totalElements || 0);
      setTotalPages(res?.totalPages || 0);
    } catch (error) {
      console.error("Lỗi làm mới danh sách sinh viên bị cấm:", error);
      setItems([]);
      setTotalItems(0);
      setTotalPages(0);
    }
  };

  const parseDateTimeValue = (value: string) => {
    return new Date(value.replace(" ", "T"));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    const sinhVienId = Number(form.sinhVienId);
    const loaiSuKienId = Number(form.loaiSuKienId);

    // Phải chọn một sinh viên hợp lệ trong danh sách
    if (
      !form.maSinhVien.trim() ||
      !Number.isInteger(sinhVienId) ||
      sinhVienId <= 0
    ) {
      errors.maSinhVien = "Vui lòng chọn sinh viên";
    }

    // Không chấp nhận lý do chỉ chứa khoảng trắng
    if (!form.lyDo.trim()) {
      errors.lyDo = "Vui lòng nhập lý do cấm";
    }

    // Loại sự kiện bắt buộc
    if (
      form.loaiSuKienId === "-1" ||
      !Number.isInteger(loaiSuKienId) ||
      loaiSuKienId <= 0
    ) {
      errors.loaiSuKienId = "Vui lòng chọn loại sự kiện";
    }

    // Ngày bắt đầu bắt buộc
    if (!form.ngayBatDau) {
      errors.ngayBatDau = "Vui lòng chọn ngày bắt đầu";
    } else if (Number.isNaN(parseDateTimeValue(form.ngayBatDau).getTime())) {
      errors.ngayBatDau = "Ngày bắt đầu không hợp lệ";
    }

    if (form.ngayKetThuc) {
      const endDate = parseDateTimeValue(form.ngayKetThuc);

      if (Number.isNaN(endDate.getTime())) {
        errors.ngayKetThuc = "Ngày kết thúc không hợp lệ";
      }
    }

    if (form.ngayBatDau && form.ngayKetThuc) {
      const startDate = parseDateTimeValue(form.ngayBatDau);
      const endDate = parseDateTimeValue(form.ngayKetThuc);

      if (
        !Number.isNaN(startDate.getTime()) &&
        !Number.isNaN(endDate.getTime()) &&
        endDate < startDate
      ) {
        errors.ngayKetThuc = "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu";
      }
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    const isEditing = mode === "edit" && Boolean(editingId);

    try {
      const payload = {
        sinhVienId: Number(form.sinhVienId),
        maSinhVien: form.maSinhVien.trim(),
        lyDo: form.lyDo.trim(),
        ngayBatDau: formatDateMMDDYYYY(form.ngayBatDau),
        ngayKetThuc: form.ngayKetThuc
          ? formatDateMMDDYYYY(form.ngayKetThuc)
          : null,
        loaiSuKienId: Number(form.loaiSuKienId),
      };

      if (isEditing && editingId) {
        await updateSinhVienBiCam(editingId, payload);
      } else {
        await createSinhVienBiCam(payload);
      }

      handleCloseForm();
      setPage(1);
      await loadData(1, pageSize);
      showNoti(
        "success",
        isEditing
          ? "Cập nhật sinh viên bị cấm thành công."
          : "Thêm sinh viên bị cấm thành công.",
      );
    } catch (error) {
      console.error("Lỗi lưu sinh viên bị cấm:", error);
      showNoti(
        "error",
        isEditing
          ? "Cập nhật sinh viên bị cấm thất bại."
          : "Thêm sinh viên bị cấm thất bại.",
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadData(1, pageSize);
  }, []);

  return (
    <>
      <DanhMucFeaturePage
        type="sinhVienBiCam"
        title="Danh sách sinh viên bị cấm"
        description="Theo dõi danh sách sinh viên bị cấm ra vào ký túc xá."
        items={items}
        page={page}
        pageSize={pageSize}
        onEdit={handleEdit}
        icon={<IconLockFilled size={20} />}
        searchControls={
          <Stack gap="md" w="100%">
            <Group align="end" style={{ flexGrow: 1, gap: "16px" }}>
              <TextInput
                label="Mã sinh viên"
                placeholder="Nhập mã sinh viên..."
                style={{ minWidth: 200, flex: 1 }}
                value={maSinhVienSearch}
                onChange={(event) =>
                  setMaSinhVienSearch(event.currentTarget.value)
                }
              />
              <Button
                leftSection={<IconSearch size={18} />}
                color="blue"
                radius="md"
                onClick={handleSearch}
              >
                Tìm kiếm
              </Button>
              <Button
                leftSection={<IconRefresh size={18} />}
                variant="default"
                radius="md"
                onClick={handleReset}
              >
                Làm mới
              </Button>
              <Button
                leftSection={<IconAdOff size={18} />}
                color="blue"
                radius="md"
                onClick={handleAdd}
              >
                Thêm sinh viên
              </Button>
            </Group>
          </Stack>
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
        onClose={handleCloseForm}
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
            required
            error={formErrors.maSinhVien}
            nothingFoundMessage="Không tìm thấy sinh viên"
            onSearchChange={loadSinhVienOptions}
            onChange={(value) => {
              const selectedSv = sinhVienList.find(
                (sv) => String(sv.maSinhVien).trim() === value,
              );

              setForm((prev) => ({
                ...prev,
                maSinhVien: value || "",
                sinhVienId: selectedSv
                  ? String(selectedSv.sinhVienId ?? selectedSv.id ?? "-1")
                  : "-1",
              }));

              setFormErrors((prev) => ({
                ...prev,
                maSinhVien: undefined,
              }));
            }}
            flex={1}
          />

          <Textarea
            label="Lý do cấm"
            placeholder="Nhập lý do cấm"
            minRows={4}
            required
            error={formErrors.lyDo}
            value={form.lyDo}
            onChange={(event) => {
              const value = event.currentTarget.value;

              setForm((prev) => ({
                ...prev,
                lyDo: value,
              }));

              setFormErrors((prev) => ({
                ...prev,
                lyDo: undefined,
              }));
            }}
          />

          <DateInput
            label="Ngày bắt đầu "
            placeholder="Chọn ngày bắt đầu"
            required
            clearable
            valueFormat="DD/MM/YYYY"
            value={form.ngayBatDau || null}
            error={formErrors.ngayBatDau}
            onChange={(value) => {
              setForm((prev) => ({
                ...prev,
                ngayBatDau: value || "",
              }));

              setFormErrors((prev) => ({
                ...prev,
                ngayBatDau: undefined,
                ngayKetThuc: undefined,
              }));
            }}
          />

          <DateInput
            label="Ngày kết thúc"
            placeholder="Chọn ngày kết thúc"
            clearable
            valueFormat="DD/MM/YYYY"
            value={form.ngayKetThuc || null}
            minDate={form.ngayBatDau || undefined}
            error={formErrors.ngayKetThuc}
            onChange={(value) => {
              setForm((prev) => ({
                ...prev,
                ngayKetThuc: value || "",
              }));

              setFormErrors((prev) => ({
                ...prev,
                ngayKetThuc: undefined,
              }));
            }}
          />

          <Select
            label="Loại sự kiện"
            placeholder="Chọn loại sự kiện"
            data={loaiSuKienOptions}
            value={form.loaiSuKienId === "-1" ? null : form.loaiSuKienId}
            searchable
            clearable
            required
            error={formErrors.loaiSuKienId}
            nothingFoundMessage="Không tìm thấy loại sự kiện"
            onChange={(value) => {
              setForm((prev) => ({
                ...prev,
                loaiSuKienId: value || "-1",
              }));

              setFormErrors((prev) => ({
                ...prev,
                loaiSuKienId: undefined,
              }));
            }}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleCloseForm}>
              Hủy
            </Button>

            <Button
              color="blue"
              leftSection={<IconDeviceFloppy size={18} />}
              onClick={handleSave}
              loading={saving}
              disabled={saving}
            >
              {mode === "edit" ? "Cập nhật" : "Lưu"}
            </Button>
          </Group>
        </Stack>
      </Drawer>
    </>
  );
}
