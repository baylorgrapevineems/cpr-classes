import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get("admin_auth")?.value === "1";
}

export function unauthorized() {
  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}
