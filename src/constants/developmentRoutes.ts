// Mục đích: không để whitelist nằm rải rác trong nhiều file.
export const KTX_DEVELOPMENT_VISIBLE_ROUTES = [
    "/dashboard",
    "/thong-ke",
    "/history",
    "/warnings",
    "/camera",
    "/danh-muc",

// Quản trị hệ thống
    "/settings",
    "/manage-users",
    "/manage-roles",
];

export const PUBLIC_APP_ROUTES = [
    "/no-permission",
    "/splashscreen",
    "/login",
];