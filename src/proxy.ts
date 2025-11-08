
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { verifyTokenFromCookie } from "@/lib/verify";

// // ✅ Routes thực tế (không có parentheses)
// const AUTH_ROUTES = ['/overview', '/profile', '/bnbfund', '/bnbcard', '/faq', '/support'];
// const ADMIN_ROUTES = ['/dashboard', '/user', '/fund', '/images', '/wallet'];
// const GUEST_ROUTES = ['/home', '/login', '/register', '/forgot-password', '/reset-password'];

// export async function middleware(req: NextRequest) {
//   const url = req.nextUrl.clone();
//   const token = req.cookies.get("token")?.value;
//   const user = token && token.trim() !== "" ? await verifyTokenFromCookie(token) : null;

//   // 🔍 Debug pathname thực tế
//   console.log(`🔍 Raw pathname: "${url.pathname}"`);
//   console.log(`🔍 Is auth route: ${url.pathname.startsWith('/(auth)')}`);
//   console.log(`🔍 Is admin route: ${url.pathname.startsWith('/(admin)')}`);
//   console.log(`🚀 MIDDLEWARE TRIGGERED for: ${req.nextUrl.pathname}`);
  
//   // 🔍 Debug
//   console.log(`🚀 MIDDLEWARE: ${url.pathname}`);
//   console.log(`🔍 User: ${user?.role || 'GUEST'}`);
  
//   // ✅ Rule 1: Guest vào Auth routes → redirect login
//   if (!user && AUTH_ROUTES.includes(url.pathname)) {
//     console.log(`🚫 Guest accessing auth route - redirecting to login`);
//     url.pathname = '/login';
//     return NextResponse.redirect(url);
//   }

//   // ✅ Rule 2: Guest vào Admin routes → redirect login  
//   if (!user && ADMIN_ROUTES.includes(url.pathname)) {
//     console.log(`🚫 Guest accessing admin route - redirecting to login`);
//     url.pathname = '/login';
//     return NextResponse.redirect(url);
//   }

//   // ✅ Rule 3: USER vào Admin routes → redirect overview
//   if (user?.role === "USER" && ADMIN_ROUTES.includes(url.pathname)) {
//     console.log(`🚫 User accessing admin route - redirecting to overview`);
//     url.pathname = '/overview';
//     return NextResponse.redirect(url);
//   }

//   // ✅ Rule 4: ADMIN vào User routes → redirect overview
//   // if (user?.role === "ADMIN" && AUTH_ROUTES.includes(url.pathname)) {
//   //   console.log(`🚫 Admin accessing admin route - redirecting to dashboard`);
//   //   url.pathname = '/dashboard';
//   //   return NextResponse.redirect(url);
//   // }

//   // ✅ Rule 5: Logged in vào login/register → redirect
//   if (user && (url.pathname === '/login' || url.pathname === '/register')) {
//     const redirectPath = user.role === "ADMIN" ? '/dashboard' : '/overview';
//     console.log(`✅ Already logged in - redirecting to ${redirectPath}`);
//     url.pathname = redirectPath;
//     return NextResponse.redirect(url);
//   }

//   if (user && url.pathname === '/') {
//     if (user.role === "USER") {
//       url.pathname = '/overview';
//     }else{
//       url.pathname = '/dashboard';
//     }
//     return NextResponse.redirect(url);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     // Auth routes
//     '/overview',
//     '/profile', 
//     '/bnbfund',
//     '/bnbcard',
//     '/faq',
//     '/support',
    
//     // Admin routes  
//     '/dashboard',
//     '/user',
//     '/fund', 
//     '/images', 
//     '/wallet',
    
//     // Guest auth pages
//     '/login',
//     '/register'
//   ],
// };

// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyUser } from "./lib/verify";

// Các route cần bảo vệ
const AUTH_ROUTES = ['/overview', '/profile', '/bnbfund', '/bnbcard', '/faq', '/support'];
const ADMIN_ROUTES = ['/dashboard', '/user', '/fund', '/images', '/wallet'];
const GUEST_ROUTES = ['/home', '/login', '/register', '/forgot-password', '/reset-password'];

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get("token")?.value || null;

  console.log(`🚀 MIDDLEWARE TRIGGERED for: ${url.pathname}`);
  console.log(`🔍 Token present: ${!!token}`);

  // ✅ Xác thực token bằng joseconst auth = await verifyUser();
  const user = await verifyUser();
  // if (!user) {
  //   console.log(`🚫 Unauthenticated user -> /login`);
  //   return NextResponse.redirect(new URL("/login", req.url));
  // }
  // NextResponse.redirect(new URL("/login", req.url));
  // const user = await verifyTokenFromCookie(token);
  // console.log(`🔍 User: ${user?.role || "GUEST"}`);

  // 🚫 Guest vào Auth routes
  if (!user && AUTH_ROUTES.includes(url.pathname)) {
    console.log(`🚫 Guest accessing protected route -> /login`);
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 🚫 Guest vào Admin routes
  if (!user && ADMIN_ROUTES.includes(url.pathname)) {
    console.log(`🚫 Guest accessing admin route -> /login`);
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 🚫 USER vào Admin route
  if (user?.role === "USER" && ADMIN_ROUTES.includes(url.pathname)) {
    console.log(`🚫 User accessing admin route -> /overview`);
    url.pathname = '/overview';
    return NextResponse.redirect(url);
  }

  // 🚫 ADMIN vào Auth route → redirect dashboard
  // if (user?.role === "ADMIN" && AUTH_ROUTES.includes(url.pathname)) {
  //   console.log(`🚫 Admin accessing user route -> /dashboard`);
  //   url.pathname = '/dashboard';
  //   return NextResponse.redirect(url);
  // }

  // ✅ Logged in → chặn truy cập login/register
  // if (user && (url.pathname === '/login' || url.pathname === '/register')) {
  //   const redirectPath = user.role === "ADMIN" ? '/dashboard' : '/overview';
  //   console.log(`✅ Already logged in -> ${redirectPath}`);
  //   url.pathname = redirectPath;
  //   return NextResponse.redirect(url);
  // }

  // ✅ Gốc (/) → tự redirect theo role
  if (user && url.pathname === '/') {
    url.pathname = user.role === "ADMIN" ? '/dashboard' : '/overview';
    return NextResponse.redirect(url);
  }

  return NextResponse.next()

}


export const config = {
  matcher: [
    // User routes
    '/overview',
    '/profile',
    '/bnbfund',
    '/bnbcard',
    '/faq',
    '/support',

    // Admin routes
    '/dashboard',
    '/user',
    '/fund',
    '/images',
    '/wallet',

    // Auth routes
    '/login',
    '/register'
  ],
};
