"use client";

import DanhMucFeaturePage from "./DanhMucFeaturePage";

export default function PhongKtxPage() {
  return (
    <DanhMucFeaturePage
      title="Lấy danh sách phòng ký túc xá"
      description="Quản lý danh mục phòng theo khu ký túc xá."
      endpoint="{base.url}/ktx-service/ktx-dm-phong/paginate"
      columns={[
        { key: "maPhong", label: "Mã phòng" },
        { key: "tenPhong", label: "Tên phòng" },
        { key: "khu", label: "Khu" },
        { key: "sucChua", label: "Sức chứa" },
        { key: "ghiChu", label: "Ghi chú" },
      ]}
    />
  );
}
