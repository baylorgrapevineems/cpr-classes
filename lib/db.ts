import { neon } from "@neondatabase/serverless";

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export async function initDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS classes (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      course_type TEXT NOT NULL DEFAULT 'BLS',
      class_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME,
      location TEXT NOT NULL,
      address TEXT,
      instructor_name TEXT,
      max_seats INTEGER NOT NULL DEFAULT 12,
      description TEXT,
      is_public BOOLEAN NOT NULL DEFAULT TRUE,
      is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      organization TEXT,
      registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      attended BOOLEAN,
      passed BOOLEAN,
      card_number TEXT,
      card_issued_at DATE,
      card_expires_at DATE,
      notes TEXT
    )
  `;
}
