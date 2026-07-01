 

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
 

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log('->>>>>>>>>>>>>> Middleware is running <<<<<<<<<<<<-' ); 

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
  console.log('-----------> isProtectedRoute:', isProtectedRoute);
  
  // Nếu người dùng chưa đăng nhập và vào route yêu cầu đăng nhập
  if (isProtectedRoute && !token) {
    console.log('Chưa đăng nhập ------ isProtectedRoute && !token:' );
    const redirectUrl = new URL(`/${locale}/login`, req.url);  // Chuyển hướng đến /login
    return NextResponse.redirect(redirectUrl);
  }

  // Nếu người dùng chưa đăng nhập và vào trang chủ '/', chuyển đến splashscreen hoặc login
  if (!token && pathname === '/') {
    console.log('Chưa đăng nhập ------ !token && pathname === /:' );
    const redirectUrl = new URL(`/splashscreen`, req.url); // Chuyển hướng đến trang splashscreen
    return NextResponse.redirect(redirectUrl);
  }

  // Nếu người dùng đã đăng nhập và vào trang login, chuyển về dashboard
  if (token && pathname.endsWith('/login')) {
    console.log('Đã đăng nhập ------  token && pathname === /login:' );
    const redirectUrl = new URL(`/${locale}/dashboard`, req.url);  // Chuyển hướng đến dashboard
    return NextResponse.redirect(redirectUrl);
  }

  // Nếu người dùng đã đăng nhập và vào trang splashscreen, chuyển về dashboard
  if (token && pathname === '/splashscreen') {
    console.log('Đã đăng nhập ------  token && pathname === /splashscreen:' );
    const redirectUrl = new URL(`/${locale}/dashboard`, req.url);  // Chuyển hướng đến dashboard
    return NextResponse.redirect(redirectUrl);
  }

  // Nếu người dùng đã đăng nhập và vào trang chủ '/', chuyển ngay tới dashboard
  if (token && pathname === '/') {
    console.log('Đã đăng nhập ------ token && pathname === /:' );
    const redirectUrl = new URL(`/${locale}/dashboard`, req.url);  // Chuyển hướng đến dashboard
    return NextResponse.redirect(redirectUrl);
  }
 

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*|favicon.ico|robots.txt).*)'], // Đảm bảo rằng matcher này sẽ kiểm tra tất cả các route ngoài các route API hoặc Next.js
};
