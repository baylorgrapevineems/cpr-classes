import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const maxDuration = 60;

const FIELD_VALUES = [
  "first_name",
  "last_name",
  "full_name",
  "email",
  "phone",
  "address",
  "notes",
  "ignore",
] as const;
type Field = (typeof FIELD_VALUES)[number];

interface ParsedRow {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  valid: boolean;
  reason?: string;
}

async function mapColumns(headers: string[], sampleRows: string[][]): Promise<Record<string, Field>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");

  const client = new Anthropic({ apiKey });

  const sampleText = sampleRows
    .map((row, i) => `Row ${i + 1}: ${headers.map((h, j) => `${h}=${row[j] ?? ""}`).join(", ")}`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    tools: [
      {
        name: "map_columns",
        description: "Map spreadsheet column headers from a CPR class roster to canonical fields.",
        input_schema: {
          type: "object",
          properties: {
            mappings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  header: { type: "string", description: "The exact original column header text." },
                  field: {
                    type: "string",
                    enum: FIELD_VALUES as unknown as string[],
                    description:
                      "Canonical field this column represents. Use 'full_name' only if a single column holds both first and last name together. Use 'ignore' for columns that don't map to anything we track (e.g. signature, employer ID, class date).",
                  },
                },
                required: ["header", "field"],
              },
            },
          },
          required: ["mappings"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "map_columns" },
    messages: [
      {
        role: "user",
        content: `Here are the column headers from a CPR class roster spreadsheet, followed by a few sample rows:\n\nHeaders: ${headers.join(" | ")}\n\n${sampleText}\n\nMap each header to the correct canonical field.`,
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a column mapping.");
  }
  const input = toolUse.input as { mappings: { header: string; field: Field }[] };

  const mapping: Record<string, Field> = {};
  for (const m of input.mappings) mapping[m.header] = m.field;
  return mapping;
}

function splitFullName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  await params; // classId isn't needed for parsing/mapping, only for the commit step

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    if (rows.length < 2) {
      return NextResponse.json({ error: "The spreadsheet doesn't have any data rows." }, { status: 400 });
    }

    const headers = rows[0].map((h) => String(h ?? "").trim());
    const dataRows = rows
      .slice(1)
      .map((r) => headers.map((_, i) => String(r[i] ?? "").trim()))
      .filter((r) => r.some((cell) => cell !== ""));

    if (dataRows.length === 0) {
      return NextResponse.json({ error: "No non-empty data rows found." }, { status: 400 });
    }

    const mapping = await mapColumns(headers, dataRows.slice(0, 3));

    // Find header index for each canonical field (first match wins)
    const indexOf = (field: Field): number => headers.findIndex((h) => mapping[h] === field);
    const idx = {
      first_name: indexOf("first_name"),
      last_name: indexOf("last_name"),
      full_name: indexOf("full_name"),
      email: indexOf("email"),
      phone: indexOf("phone"),
      address: indexOf("address"),
      notes: indexOf("notes"),
    };

    const parsedRows: ParsedRow[] = dataRows.map((row) => {
      let first_name = idx.first_name >= 0 ? row[idx.first_name] : "";
      let last_name = idx.last_name >= 0 ? row[idx.last_name] : "";
      if ((!first_name || !last_name) && idx.full_name >= 0 && row[idx.full_name]) {
        const split = splitFullName(row[idx.full_name]);
        first_name = first_name || split.first;
        last_name = last_name || split.last;
      }
      const email = idx.email >= 0 ? row[idx.email].toLowerCase() : "";
      const phone = idx.phone >= 0 ? row[idx.phone] : "";
      const address = idx.address >= 0 ? row[idx.address] : "";
      const notes = idx.notes >= 0 ? row[idx.notes] : "";

      const valid = Boolean(first_name && last_name && email);
      const reason = valid
        ? undefined
        : `Missing ${[!first_name && "first name", !last_name && "last name", !email && "email"].filter(Boolean).join(", ")}`;

      return { first_name, last_name, email, phone, address, notes, valid, reason };
    });

    return NextResponse.json({ mapping, headers, rows: parsedRows });
  } catch (err) {
    return NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });
  }
}
