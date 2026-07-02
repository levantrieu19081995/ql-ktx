"use client";
import dynamic from "next/dynamic";

// Reload client page translations
const StrangerWarningsPage = dynamic(
    () => import("@/components/pages/warnings/StrangerWarningsPage"),
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
    return <StrangerWarningsPage />;
}
