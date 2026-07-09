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

<<<<<<< HEAD
export default function ClientPage({ tab = "LICH_SU" }: ClientPageProps) {
  return <HistoryPage tab={tab} />;
=======
export default function ClientPage({
  tab,
}: {
  tab?: "LICH_SU" | "THONG_KE" | "CAN_BO" | "SINH_VIEN";
}) {
  return <HistoryPage activeTab={tab} />;
>>>>>>> 15db144f5a0b64a9ab43f45e3084df6cc936fe08
}
