// // src/app/[locale]/(app)/excel/ClientPage.tsx
// "use client";
// import dynamic from "next/dynamic";

// const ExcelImporter = dynamic(
//   () => import("@/components/common/excel/ExcelImporter"),
//   {
//     ssr: false,
//     loading: () => (
//       <div className="flex items-center justify-center h-[80vh] text-gray-500">
//         ⏳
//       </div>
//     ),
//   }
// );

// export default function ClientPage() {
//   return <ExcelImporter />;
// }
"use client";

import ExcelImporter from "@/components/common/excel/ExcelImporter";

export default function ClientPage() {
  return <ExcelImporter />;
}
