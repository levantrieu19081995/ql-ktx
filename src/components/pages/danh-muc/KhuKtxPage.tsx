/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Button, Select } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

import DanhMucFeaturePage from "./DanhMucFeaturePage";
import CustomPagination from "@/components/common/CustomPagination";
import {
  fetchDanhMucKhuKtx,
  fetchDanhSachKhuKtx,
} from "@/services/danh-muc/danhMucKtxService";

export default function KhuKtxPage() {
  const [items, setItems] = useState<any[]>([]);
  const [dsKhu, setDsKhu] = useState<any[]>([]);
  const [maKhu, setMaKhu] = useState<string | null>("-1");

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
          value: item.maKhu || "",
          label: item.tenKhu || item.maKhu || "",
        })),
      ]);
    } catch (error) {
      console.error("Lỗi lấy danh mục khu KTX:", error);
      setDsKhu([{ value: "-1", label: "Tất cả" }]);
    }
  };

  const loadData = async (pageValue = page, pageSizeValue = pageSize) => {
    try {
      const res = await fetchDanhSachKhuKtx({
        page: pageValue,
        pageSize: pageSizeValue,
        maKhu: maKhu || "-1",
      });

      setItems(res?.items || []);
      setTotalItems(res?.totalElements || 0);
      setTotalPages(res?.totalPages || 0);
    } catch (error) {
      console.error("Lỗi lấy danh sách khu KTX:", error);
      setItems([]);
      setTotalItems(0);
      setTotalPages(0);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadData(1, pageSize);
  };

  useEffect(() => {
    loadDanhMucKhu();
    loadData(1, pageSize);
  }, []);

  return (
    <DanhMucFeaturePage
      type="khu"
      title="Lấy danh sách khu trong ký túc xá"
      description="Quản lý danh mục khu, dãy nhà trong ký túc xá."
      items={items}
      searchControls={
        <>
          <Select
            label="Mã khu"
            placeholder="Chọn mã khu"
            clearable={false}
            flex={1}
            value={maKhu}
            onChange={setMaKhu}
            data={dsKhu}
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
