import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BLS CPR Classes – Baylor Grapevine EMS",
  description: "Register for AHA BLS CPR certification classes taught by Baylor Grapevine EMS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <a
          href="/admin"
          style={{
            position: "fixed", bottom: 10, right: 12,
            fontSize: 11, color: "#bbb", textDecoration: "none", opacity: 0.7,
          }}
        >
          Admin
        </a>
      </body>
    </html>
  );
}
