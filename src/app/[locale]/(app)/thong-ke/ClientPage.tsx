// src/app/[locale]/(app)/thong-ke/ClientPage.tsx
"use client";
import dynamic from "next/dynamic";

const ThongKePage = dynamic(
  () => import("@/components/pages/thong-ke/ThongKePage"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[80vh] text-gray-500">
        ⏳
      </div>
    ),
  }
);

interface ClientPageProps {
  type?: "luot-ra-vao" | "vang-mat" | "nguoi-la" | "bi-cam";
}

export default function ClientPage({ type = "luot-ra-vao" }: ClientPageProps) {
  return <ThongKePage type={type} />;
}
