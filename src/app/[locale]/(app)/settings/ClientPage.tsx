// src/app/[locale]/(app)/scheduler/ClientPage.tsx
"use client";
import dynamic from "next/dynamic";

const AnalyticsPage = dynamic(
  () => import("@/components/pages/settings/SettingPage"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[80vh] text-gray-500">
        ⏳
      </div>
    ),
  }
);

export default function ClientPage() {
  return <AnalyticsPage />;
}
