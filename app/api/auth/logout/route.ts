import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const store = await cookies();
  store.delete("admin_auth");
  const base = req.nextUrl.origin;
  return NextResponse.redirect(new URL("/admin/login", base));
}
