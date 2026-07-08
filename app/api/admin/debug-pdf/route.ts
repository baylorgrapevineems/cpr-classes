import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";
import { PDFDocument } from "pdf-lib";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const file = req.nextUrl.searchParams.get("file");
  if (!file) return NextResponse.json({ error: "?file= required" }, { status: 400 });

  const res = await fetch(`${req.nextUrl.origin}/templates/${encodeURIComponent(file)}`);
  if (!res.ok) return NextResponse.json({ error: `fetch failed: ${res.status}` }, { status: 500 });

  const bytes = new Uint8Array(await res.arrayBuffer());

  try {
    const doc  = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const form = doc.getForm();
    const fields = form.getFields().map((f) => ({
      name: f.getName(),
      type: f.constructor.name,
    }));
    return NextResponse.json({ fieldCount: fields.length, fields });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
