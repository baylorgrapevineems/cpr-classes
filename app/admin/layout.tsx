import Link from "next/link";
import { Heart } from "lucide-react";
import SignOutButton from "@/components/sign-out-button";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getPendingCardCount(): Promise<number> {
  try {
    const sql = getDb();
    const rows = await sql`SELECT COUNT(*)::int AS n FROM card_requests WHERE class_id IS NULL AND seen_at IS NULL`;
    return Number(rows[0]?.n ?? 0);
  } catch {
    return 0;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pending = await getPendingCardCount();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-red-600 rounded-md flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <Link href="/admin/classes" className="font-semibold text-gray-900 text-sm hover:text-red-600 transition-colors">
              CPR Class Manager
            </Link>
            <span className="text-gray-200 text-sm">|</span>
            <Link href="/admin/interests" className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5">
              Card Requests
              {pending > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {pending}
                </span>
              )}
            </Link>
            <span className="text-gray-200 text-sm">|</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded transition-colors"
            >
              View public site
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
