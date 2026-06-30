"use client";

import DanhMucFeaturePage from "./DanhMucFeaturePage";

export default function KhuKtxPage() {
  return (
    <DanhMucFeaturePage
      title="Lấy danh sách khu trong ký túc xá"
      description="Quản lý danh mục khu, dãy nhà trong ký túc xá."
      endpoint="{base.url}/ktx-service/ktx-dm-khu/paginate"
      columns={[
        { key: "maKhu", label: "Mã khu" },
        { key: "tenKhu", label: "Tên khu" },
        { key: "diaChi", label: "Địa chỉ" },
        { key: "trangThai", label: "Trạng thái" },
        { key: "ghiChu", label: "Ghi chú" },
      ]}
    />
  );
}
