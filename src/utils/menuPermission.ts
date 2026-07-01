// Lọc quyền menu

import { KTX_DEVELOPMENT_VISIBLE_ROUTES } from "@/constants/developmentRoutes";

export function isDevelopmentVisibleRoute(href?: string) {
  if (!href) return false;

  return KTX_DEVELOPMENT_VISIBLE_ROUTES.some((route) =>
    href.toLowerCase().startsWith(route.toLowerCase())
  );
}

export function hasViewPermission(href: string, permissions: any[]) {
  const found = permissions.find((p: any) => {
    const slug = (p.dmcnSlug || "").toLowerCase().trim();
    return slug === href.toLowerCase().trim();
  });

  return !!found?.listPermission?.some(
    (perm: any) => perm.psName === "VIEW" && perm.allowed
  );
}

export function canViewMenuItem(item: any, permissions: any[]) {
  if (item?.onClick && !item?.href) return true;

  const href = item?.href ?? "";

  if (isDevelopmentVisibleRoute(href)) return true;

  return hasViewPermission(href, permissions);
}

export function filterMenuByPermission(items: any[], permissions: any[]) {
  return items
    .map((item) => {
      if (item.children) {
        const allowedChildren = item.children.filter((child: any) =>
          canViewMenuItem(child, permissions)
        );

        return allowedChildren.length > 0
          ? { ...item, children: allowedChildren }
          : null;
      }

      return canViewMenuItem(item, permissions) ? item : null;
    })
    .filter(Boolean);
}