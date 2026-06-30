"use client";

import dynamic from "next/dynamic";

const KhuKtxPage = dynamic(
  () => import("@/components/pages/danh-muc/KhuKtxPage"),
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
  return <KhuKtxPage />;
}
