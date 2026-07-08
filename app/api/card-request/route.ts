import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { first_name, last_name, email, phone, address, notes } = await req.json();
  if (!first_name?.trim() || !last_name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }
  const sql = getDb();
  await sql`
    INSERT INTO card_requests (first_name, last_name, email, phone, address, notes)
    VALUES (${first_name.trim()}, ${last_name.trim()}, ${email.trim()},
            ${phone?.trim() || null}, ${address?.trim() || null}, ${notes?.trim() || null})
  `;
  return NextResponse.json({ ok: true });
}
