"use client";
import dynamic from "next/dynamic";

const CategoryManagementPage = dynamic(
    () => import("@/components/pages/category-management/CategoryManagementPage"),
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
    return <CategoryManagementPage />;
}
