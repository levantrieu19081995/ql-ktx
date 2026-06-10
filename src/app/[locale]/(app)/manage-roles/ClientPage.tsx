// src/app/[locale]/(app)/content/ClientPage.tsx
"use client";
import dynamic from "next/dynamic";

const ManageRolesPage = dynamic(
  () => import("@/components/pages/manage-roles/ManageRolesPage"),
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
  return <ManageRolesPage />;
}
