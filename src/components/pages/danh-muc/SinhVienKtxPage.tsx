/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Button, Select, TextInput } from "@mantine/core";
import { IconRefresh, IconSearch, IconUsers } from "@tabler/icons-react";

import DanhMucFeaturePage from "./DanhMucFeaturePage";
import CustomPagination from "@/components/common/CustomPagination";
import {
  fetchDanhSachSinhVienKtx,
  fetchDanhMucKhuKtx,
  fetchDanhSachPhongKtx,
} from "@/services/danh-muc/danhMucKtxService";
import type { SinhVienKtx } from "@/types/type-danh-muc-ktx";

export default function SinhVienKtxPage() {
  const [items, setItems] = useState<SinhVienKtx[]>([]);
  const [dsKhu, setDsKhu] = useState<{ value: string; label: string }[]>([]);
  const [dsPhong, setDsPhong] = useState<{ value: string; label: string }[]>([]);

  const [maKhu, setMaKhu] = useState<string | null>("-1");
  const [maPhong, setMaPhong] = useState<string | null>("-1");
  const [maSinhVien, setMaSinhVien] = useState("");
  const [hoTen, setHoTen] = useState("");

  const [roomsList, setRoomsList] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [debugLog, setDebugLog] = useState("");

  const loadDanhMucKhu = async () => {
    try {
      const res = await fetchDanhMucKhuKtx();
      setDsKhu([
        { value: "-1", label: "Tất cả" },
        ...res.map((item) => ({
          value: item.khuMa || item.maKhu || "",
          label: item.khuTen || item.tenKhu || item.khuMa || item.maKhu || "",
        })),
      ]);
    } catch (error) {
      console.error("Lỗi lấy danh mục khu KTX:", error);
      setDsKhu([{ value: "-1", label: "Tất cả" }]);
    }
  };

  const loadDanhMucPhong = async (khuValue: string | null) => {
    if (!khuValue || khuValue === "-1") {
      setDsPhong([{ value: "-1", label: "Tất cả" }]);
      return;
    }
    try {
      const res = await fetchDanhSachPhongKtx({
        page: 1,
        pageSize: 9999,
        maKhu: khuValue,
        maPhong: "-1",
      });
      setDsPhong([
        { value: "-1", label: "Tất cả" },
        ...(res?.items || []).map((item) => ({
          value: item.phongMa || item.maPhong || "",
          label: item.tenPhong || item.phongMa || item.maPhong || "",
        })),
      ]);
    } catch (error) {
      console.error("Lỗi lấy danh mục phòng KTX:", error);
      setDsPhong([{ value: "-1", label: "Tất cả" }]);
    }
  };

  const loadAllRooms = async () => {
    try {
      const res = await fetchDanhSachPhongKtx({
        page: 1,
        pageSize: 9999,
        maKhu: "-1",
        maPhong: "-1",
      });
      setRoomsList(res?.items || []);
    } catch (error) {
      console.error("Lỗi tải toàn bộ phòng:", error);
    }
  };

  const loadData = async (pageValue = page, pageSizeValue = pageSize) => {
    try {
      const reqParams = {
        page: pageValue,
        pageSize: pageSizeValue,
        maKhu: maKhu || "-1",
        maPhong: maPhong || "-1",
        maSinhVien: maSinhVien.trim() || undefined,
        hoTen: hoTen.trim() || undefined,
      };

      const res = await fetchDanhSachSinhVienKtx(reqParams);

      setItems(res?.items || []);
      setTotalItems(res?.totalElements || 0);
      setTotalPages(res?.totalPages || 0);

      setDebugLog(
        JSON.stringify({
          sent: reqParams,
          receivedCount: res?.items?.length || 0,
          totalElements: res?.totalElements || 0,
        })
      );
    } catch (error: any) {
      console.error("Lỗi lấy danh sách sinh viên KTX:", error);
      setItems([]);
      setTotalItems(0);
      setTotalPages(0);
      setDebugLog(JSON.stringify({ error: error?.message || String(error) }));
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadData(1, pageSize);
  };

  const handleReset = async () => {
    setMaKhu("-1");
    setMaPhong("-1");
    setMaSinhVien("");
    setHoTen("");
    setPage(1);

    try {
      const res = await fetchDanhSachSinhVienKtx({
        page: 1,
        pageSize: pageSize,
        maKhu: "-1",
        maPhong: "-1",
        maSinhVien: undefined,
        hoTen: undefined,
      });

      setItems(res?.items || []);
      setTotalItems(res?.totalElements || 0);
      setTotalPages(res?.totalPages || 0);
    } catch (error) {
      console.error("Lỗi làm mới danh sách sinh viên KTX:", error);
      setItems([]);
      setTotalItems(0);
      setTotalPages(0);
    }
  };

  // Tải danh mục khu khi component được gắn kết (mount)
  useEffect(() => {
    loadDanhMucKhu();
    loadAllRooms();
  }, []);

  // Tải lại danh mục phòng khi maKhu thay đổi
  useEffect(() => {
    setMaPhong("-1");
    loadDanhMucPhong(maKhu);
  }, [maKhu]);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    loadData(1, pageSize);
  }, []);

  // Map sinh viên với thông tin khu từ danh sách phòng nếu cần
  const mappedItems = items.map((sv) => {
    if (sv.tenKhu || sv.maKhu) {
      return sv;
    }
    if (sv.maPhong) {
      const room = roomsList.find(
        (r) => r.phongMa === sv.maPhong || r.maPhong === sv.maPhong
      );
      if (room) {
        return {
          ...sv,
          maKhu: room.maKhu || room.khuMa,
          tenKhu: room.tenKhu || room.khuTen,
        };
      }
    }
    return sv;
  });

  return (
    <DanhMucFeaturePage
      type="sinhVienKtx"
      title="Lấy danh sách sinh viên ký túc xá"
      description="Quản lý và tra cứu danh sách sinh viên đang ở ký túc xá."
      items={mappedItems}
      icon={<IconUsers size={20} />}
      searchControls={
        <>
          <Select
            label="Khu ký túc xá"
            placeholder="Chọn khu..."
            data={dsKhu}
            value={maKhu}
            onChange={(value) => setMaKhu(value)}
            clearable={false}
            style={{ minWidth: 150 }}
          />

          <Select
            label="Phòng"
            placeholder="Chọn phòng..."
            data={dsPhong}
            value={maPhong}
            onChange={(value) => setMaPhong(value)}
            clearable={false}
            style={{ minWidth: 150 }}
          />

          <TextInput
            label="Mã sinh viên"
            placeholder="Nhập mã sinh viên..."
            value={maSinhVien}
            onChange={(event) => setMaSinhVien(event.currentTarget.value)}
            style={{ minWidth: 180 }}
          />

          <TextInput
            label="Họ tên"
            placeholder="Nhập họ tên..."
            value={hoTen}
            onChange={(event) => setHoTen(event.currentTarget.value)}
            style={{ minWidth: 200 }}
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
  );
}
