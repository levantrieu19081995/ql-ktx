"use client";

import DanhMucFeaturePage from "./DanhMucFeaturePage";

export default function SinhVienKtxPage() {
  return (
    <DanhMucFeaturePage
      type="sinhVienKtx"
      title="Lấy danh sách sinh viên ký túc xá"
      description="Quản lý và tra cứu danh sách sinh viên đang ở ký túc xá."
      items={[
        {
          sinhVienId: 1,
          maSinhVien: "B1606947",
          hoTen: "Lê Văn Triệu",
          maKhu: "A",
          maPhong: "A101",
          trangThai: "Đang ở",
        },
        {
          sinhVienId: 2,
          maSinhVien: "B1700123",
          hoTen: "Nguyễn Văn A",
          maKhu: "B",
          maPhong: "B203",
          trangThai: "Đang ở",
        },
        {
          sinhVienId: 3,
          maSinhVien: "B1800456",
          hoTen: "Trần Thị B",
          maKhu: "C",
          maPhong: "C305",
          trangThai: "Tạm vắng",
        },
      ]}
    />
  );
}
