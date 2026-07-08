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
      is_completed BOOLEAN NOT NULL DEFAULT FALSE,
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
      notes TEXT,
      eval_token TEXT UNIQUE,
      eval_sent_at TIMESTAMPTZ
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS evaluations (
      id SERIAL PRIMARY KEY,
      registration_id INTEGER NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      inst_q1 TEXT, inst_q2 TEXT, inst_q3 TEXT,
      content_q1 TEXT, content_q2 TEXT, content_q3 TEXT, content_q4 TEXT, content_q5 TEXT,
      skill_q1 TEXT, skill_q2 TEXT, skill_q3 TEXT, skill_q4 TEXT,
      comment_learning TEXT, comment_strengths TEXT, comment_future TEXT
    )
  `;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS eval_token TEXT UNIQUE`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS eval_sent_at TIMESTAMPTZ`;
}
