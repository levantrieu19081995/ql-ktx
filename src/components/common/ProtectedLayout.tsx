/* eslint-disable react-hooks/exhaustive-deps */
"use client";
//src\components\common\ProtectedLayout.tsx
import { ReactNode, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import usePermissions from "@/hooks/usePermissions";
import { useSessionStore } from "@/context/sessionStore";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  //   const pathname = usePathname();
  const { expired } = useSessionStore();
  const pathname = usePathname() ?? "";
  const { status } = useSession(); // Trạng thái NextAuth
  const { permissions, loading, reloadPermissions } = usePermissions();

  const [checked, setChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [isFetched, setIsFetched] = useState(false); // Đảm bảo đã gọi load ít nhất 1 lần

  // Gọi load thủ công lần đầu sau khi session có
  useEffect(() => {
    if (status === "authenticated" && !isFetched) {
      reloadPermissions().then(() => setIsFetched(true));
    }
  }, [status, isFetched, reloadPermissions]);

  const redirectNoPermission = useCallback(
    (locale?: string) => {
      const lang = locale || pathname.split("/")[1] || "vi";
      if (!expired) {
        return;
      }
      router.replace(`/${lang}/no-permission`);
      router.refresh();
    },
    [pathname, router]
  );

  useEffect(() => {
    // 1. Chưa có session => chờ
    if (status === "loading") return;

    // 2. Chưa fetch quyền xong
    if (!isFetched || loading) return;

    const parts = pathname.split("/");
    const locale = parts[1] || "vi";
    const currentSlug = parts.length > 2 ? `/${parts[2].toLowerCase()}` : "/";

    // 3. Kiểm tra whitelist trước
    const whitelist = [
      "/dashboard",
      "/thong-ke",
      "/no-permission",
      "/splashscreen",
      "/login",
      "/excel",
      "/history",
      "/warnings",
    ];
    if (whitelist.includes(currentSlug)) {
      setChecked(true);
      setHasAccess(true);
      return;
    }

    // 4. Nếu không có quyền sau khi đã fetch (và không nằm trong whitelist)
    if (!permissions || permissions.length === 0) {
      setChecked(true);
      setHasAccess(false);
      redirectNoPermission(locale);
      return;
    }

    // 5. Kiểm tra quyền cụ thể
    const allowedSlugs = permissions.map(
      (p) => p.dmcnSlug?.toLowerCase() || ""
    );

    const canAccess = allowedSlugs.some((slug) => slug === currentSlug);

    setChecked(true);
    setHasAccess(canAccess);

    if (!canAccess) redirectNoPermission(locale);
  }, [permissions, loading, isFetched, pathname, status, redirectNoPermission]);

  // Chưa có session hoặc chưa load quyền
  if (status === "loading" || loading || !isFetched || !checked) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-gray-500">
        ⏳
      </div>
    );
  }

  // Không có quyền
  if (!hasAccess) return null;

  // Có quyền
  return <>{children}</>;
}
