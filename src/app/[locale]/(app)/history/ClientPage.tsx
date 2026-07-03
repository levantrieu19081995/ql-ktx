// src/app/[locale]/(app)/content/ClientPage.tsx
"use client";
import dynamic from "next/dynamic";
type LoaiTabChinh = "LICH_SU" | "THONG_KE";

type ClientPageProps = {
  tab?: LoaiTabChinh;
};

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

export default function ClientPage({
  tab,
}: {
  tab?: "LICH_SU" | "THONG_KE" | "CAN_BO" | "SINH_VIEN";
}) {
  return <HistoryPage activeTab={tab} />;
}
