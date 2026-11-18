"use client";

import dynamic from "next/dynamic";

const SinhVienNoPhiPage = dynamic(
  () => import("@/components/pages/danh-muc/SinhVienNoPhiPage"),
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
  return <SinhVienNoPhiPage />;
}
