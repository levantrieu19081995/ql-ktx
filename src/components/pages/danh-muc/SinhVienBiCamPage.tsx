"use client";

import DanhMucFeaturePage from "./DanhMucFeaturePage";

export default function SinhVienBiCamPage() {
  return (
    <DanhMucFeaturePage
      title="Lấy danh sách sinh viên bị cấm"
      description="Theo dõi danh sách sinh viên bị cấm ra vào ký túc xá."
      endpoint="{base.url}/ktx-service/ktx-sinh-vien-cam/paginate"
      columns={[
        { key: "mssv", label: "MSSV" },
        { key: "hoTen", label: "Họ tên" },
        { key: "lyDo", label: "Lý do" },
        { key: "tuNgay", label: "Từ ngày" },
        { key: "denNgay", label: "Đến ngày" },
      ]}
    />
  );
}
