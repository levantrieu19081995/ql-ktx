 

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";  

// const PROTECTED = [
//   '/dashboard',
//   '/settings',
//   '/manage-users'
// ];

const PROTECTED = [
  "/dashboard",
  "/thong-ke",
  "/history",
  "/warnings",
  "/danh-muc",
  "/settings",
  "/manage-users",
  "/manage-roles",
];

function getPublicOrigin(req: NextRequest): string {
  const configuredOrigin = process.env.NEXTAUTH_URL;
  if (configuredOrigin) {
    try {
      return new URL(configuredOrigin).origin;
    } catch {
      // Fall back to reverse-proxy headers when the configured URL is invalid.
    }
  }

  const forwardedHost = req.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    .trim();
  const host = forwardedHost || req.headers.get("host");
  const forwardedProto = req.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    .trim();
  const protocol = forwardedProto || req.nextUrl.protocol.replace(":", "");

  return host ? `${protocol}://${host}` : req.nextUrl.origin;
}

function redirectTo(req: NextRequest, pathname: string) {
  return NextResponse.redirect(new URL(pathname, getPublicOrigin(req)));
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Nếu là các route của NextAuth, không can thiệp
  if (pathname.startsWith('/api/auth')) return NextResponse.next();

  if ( pathname.startsWith("/api/auth/permissions")) {
   return NextResponse.next();
  }
  // if (pathname.startsWith("/api") || pathname.startsWith("/_next")) return NextResponse.next();

  // Lấy token session
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  // console.log('-----------> Token:', token); // Log token để kiểm tra giá trị của nó

  // Lấy locale từ URL
  const locale = pathname.split('/')[1] || 'vi';  // Lấy locale từ URL hoặc mặc định là 'vi'

  const pathWithoutLocale = pathname.replace(/^\/(vi|en)(?=\/|$)/, "") || "/";

  const isProtectedRoute = PROTECTED.some((p) =>
    pathWithoutLocale.startsWith(p)
  );
  
  // Kiểm tra route có yêu cầu bảo vệ không
  // const isProtectedRoute = PROTECTED.some(p => pathname.startsWith(p));
  // Nếu người dùng chưa đăng nhập và vào route yêu cầu đăng nhập
  if (isProtectedRoute && !token) {
    return redirectTo(req, `/${locale}/login`);
  }

  // Nếu người dùng chưa đăng nhập và vào trang chủ '/', chuyển đến splashscreen hoặc login
  if (!token && pathname === '/') {
    return redirectTo(req, "/splashscreen");
  }

  // Nếu người dùng đã đăng nhập và vào trang login, chuyển về dashboard
  if (token && pathname.endsWith('/login')) {
    return redirectTo(req, `/${locale}/dashboard`);
  }

  // Nếu người dùng đã đăng nhập và vào trang splashscreen, chuyển về dashboard
  if (token && pathname === '/splashscreen') {
    return redirectTo(req, `/${locale}/dashboard`);
  }

  // Nếu người dùng đã đăng nhập và vào trang chủ '/', chuyển ngay tới dashboard
  if (token && pathname === '/') {
    return redirectTo(req, `/${locale}/dashboard`);
  }
 

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*|favicon.ico|robots.txt).*)'], // Đảm bảo rằng matcher này sẽ kiểm tra tất cả các route ngoài các route API hoặc Next.js
};
