"use client";

import DanhMucFeaturePage from "./DanhMucFeaturePage";

export default function CapNhatSinhVienBiCamPage() {
  return (
    <DanhMucFeaturePage
      title="Thêm/sửa sinh viên bị cấm"
      description="Màn hình thao tác thêm mới hoặc cập nhật thông tin sinh viên bị cấm."
      endpoint="{base.url}/ktx-service/ktx-sinh-vien-cam/create (update)"
      columns={[
        { key: "mssv", label: "MSSV" },
        { key: "hoTen", label: "Họ tên" },
        { key: "lyDo", label: "Lý do cấm" },
        { key: "thoiHan", label: "Thời hạn" },
        { key: "thaoTac", label: "Thao tác" },
      ]}
    />
  );
}
