"use client";

import dynamic from "next/dynamic";

const CapNhatSinhVienBiCamPage = dynamic(
  () => import("@/components/pages/danh-muc/CapNhatSinhVienBiCamPage"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[80vh] text-gray-500">
        ...
      </div>
    ),
  },
);

export default function ClientPage() {
  return <CapNhatSinhVienBiCamPage />;
}
