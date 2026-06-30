"use client";

import DanhMucFeaturePage from "./DanhMucFeaturePage";

export default function SinhVienKtxPage() {
  return (
    <DanhMucFeaturePage
      title="Lấy danh sách sinh viên ký túc xá"
      description="Quản lý và tra cứu danh sách sinh viên đang ở ký túc xá."
      endpoint="{base.url}/ktx-service/ktx-dm-sinh-vien/paginate"
      columns={[
        { key: "mssv", label: "MSSV" },
        { key: "hoTen", label: "Họ tên" },
        { key: "khu", label: "Khu" },
        { key: "phong", label: "Phòng" },
        { key: "trangThai", label: "Trạng thái" },
      ]}
    />
  );
}
