// src/app/[locale]/(app)/camera/page.tsx
"use client";

import dynamic from "next/dynamic";

const CameraPage = dynamic(
  () => import("@/components/pages/camera/CameraPage"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[80vh] text-gray-500">
        ⏳
      </div>
    ),
  },
);

export default function Page() {
  return <CameraPage />;
}
