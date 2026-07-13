/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Button, Group, Select, Stack } from "@mantine/core";
import {
  IconBuildingTunnel,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";

import DanhMucFeaturePage from "./DanhMucFeaturePage";
import CustomPagination from "@/components/common/CustomPagination";
import {
  fetchDanhSachPhongKtx,
  fetchDanhMucKhuKtx,
} from "@/services/danh-muc/danhMucKtxService";
import type { PhongKtx } from "@/types/type-danh-muc-ktx";

export default function PhongKtxPage() {
  const [items, setItems] = useState<PhongKtx[]>([]);
  const [dsKhu, setDsKhu] = useState<{ value: string; label: string }[]>([]);
  const [dsPhong, setDsPhong] = useState<{ value: string; label: string }[]>(
    [],
  );

  const [maKhu, setMaKhu] = useState<string | null>("-1");
  const [maPhong, setMaPhong] = useState<string | null>("-1");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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

  const loadDanhMucPhongOptions = async (khuValue: string | null) => {
    try {
      const res = await fetchDanhSachPhongKtx({
        page: 1,
        pageSize: 9999,
        maKhu: khuValue || "-1",
        maPhong: "-1",
      });
      setDsPhong([
        { value: "-1", label: "Tất cả" },
        ...(res?.items || []).map((item: PhongKtx) => ({
          value: item.maPhong || item.phongMa || "",
          label: item.tenPhong || item.phongMa || item.maPhong || "",
        })),
      ]);
    } catch (error) {
      console.error("Lỗi lấy danh mục phòng KTX:", error);
      setDsPhong([{ value: "-1", label: "Tất cả" }]);
    }
  };

  const loadData = async (pageValue = page, pageSizeValue = pageSize) => {
    try {
      const res = await fetchDanhSachPhongKtx({
        page: pageValue,
        pageSize: pageSizeValue,
        maKhu: maKhu || "-1",
        maPhong: maPhong || "-1",
      });

      setItems(res?.items || []);
      setTotalItems(res?.totalElements || 0);
      setTotalPages(res?.totalPages || 0);
    } catch (error) {
      console.error("Lỗi lấy danh sách phòng KTX:", error);
      setItems([]);
      setTotalItems(0);
      setTotalPages(0);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadData(1, pageSize);
  };

  const handleReset = async () => {
    setMaKhu("-1");
    setMaPhong("-1");
    setPage(1);

    try {
      const res = await fetchDanhSachPhongKtx({
        page: 1,
        pageSize: pageSize,
        maKhu: "-1",
        maPhong: "-1",
      });

      setItems(res?.items || []);
      setTotalItems(res?.totalElements || 0);
      setTotalPages(res?.totalPages || 0);
    } catch (error) {
      console.error("Lỗi làm mới danh sách phòng KTX:", error);
      setItems([]);
      setTotalItems(0);
      setTotalPages(0);
    }
  };

  useEffect(() => {
    loadDanhMucKhu();
  }, []);

  useEffect(() => {
    setMaPhong("-1");
    loadDanhMucPhongOptions(maKhu);
  }, [maKhu]);

  useEffect(() => {
    loadData(1, pageSize);
  }, []);

  return (
    <DanhMucFeaturePage
      type="phongKtx"
      title="Lấy danh sách phòng ký túc xá"
      description="Quản lý danh mục phòng theo khu ký túc xá."
      items={items}
      icon={<IconBuildingTunnel size={20} />}
      searchControls={
        <Stack gap="md" w="100%">
          <Group align="end" style={{ flexGrow: 1, gap: "16px" }}>
            <Select
              label="Khu ký túc xá"
              placeholder="Chọn khu..."
              data={dsKhu}
              value={maKhu}
              onChange={(value) => setMaKhu(value)}
              clearable={false}
              style={{ minWidth: 180, flex: 1 }}
            />
            <Select
              label="Phòng"
              placeholder="Chọn phòng..."
              data={dsPhong}
              value={maPhong}
              onChange={(value) => setMaPhong(value)}
              clearable={false}
              style={{ minWidth: 180, flex: 1 }}
            />{" "}
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
  );
}
