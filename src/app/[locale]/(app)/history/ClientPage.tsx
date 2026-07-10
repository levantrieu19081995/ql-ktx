// src/app/[locale]/(app)/history/ClientPage.tsx
"use client";
import dynamic from "next/dynamic";

const HistoryPage = dynamic(
  () => import("@/components/pages/history/HistoryPage"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[80vh] text-gray-500">
        ⏳
      </div>
    ),
  },
);

export default function ClientPage() {
  return <HistoryPage />;
}

