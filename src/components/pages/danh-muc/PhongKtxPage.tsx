"use client";

import DanhMucFeaturePage from "./DanhMucFeaturePage";

export default function PhongKtxPage() {
  return (
    <DanhMucFeaturePage
      type="phongKtx"
      title="Lấy danh sách phòng ký túc xá"
      description="Quản lý danh mục phòng theo khu ký túc xá."
      items={[
        {
          phongId: 1,
          maPhong: "A101",
          tenPhong: "Phòng A101",
          maKhu: "A",
          sucChua: 8,
          soNguoiHienTai: 6,
          ghiChu: "Dữ liệu mẫu",
        },
        {
          phongId: 2,
          maPhong: "A102",
          tenPhong: "Phòng A102",
          maKhu: "A",
          sucChua: 8,
          soNguoiHienTai: 8,
          ghiChu: "-",
        },
        {
          phongId: 3,
          maPhong: "B201",
          tenPhong: "Phòng B201",
          maKhu: "B",
          sucChua: 10,
          soNguoiHienTai: 7,
          ghiChu: "Dữ liệu mẫu",
        },
      ]}
    />
  );
}
