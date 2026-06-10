// "use client";
// // src\hooks\usePermissionGuard.ts
// import { useEffect } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import usePermissions from "./usePermissions";

// export default function usePermissionGuard() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const { permissions, loading } = usePermissions();

//   useEffect(() => {
//     if (loading) return; // chờ load quyền
//     if (!permissions?.length) return;

//     const allowedSlugs = permissions.map(p => p.dmcnSlug?.toLowerCase() || "");
//     const currentSlug = pathname.split("?")[0].toLowerCase();

//     // Nếu không nằm trong danh sách quyền -> redirect
//     const hasAccess = allowedSlugs.some(slug => currentSlug.includes(slug));
//     if (!hasAccess) {
//       console.warn(`No permission for: ${currentSlug}`);
//       router.replace("/vi/no-permissisonssss");
//     }
//   }, [permissions, loading, pathname, router]);
// }
