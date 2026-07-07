import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PREFIXES = [
  "/admin/login",
  "/api/auth",
  "/api/db-init",
  "/api/classes",
  "/_next",
  "/favicon.ico",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const auth = req.cookies.get("admin_auth")?.value;
  if (auth !== "1") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
