import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bay 4 Assignments — Valley View",
  description:
    "Bay 4 door utilization and assignment tracking for Valley View warehouse — DOCK50–DOCK72",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#0a0a0f] text-[#f4f4f6] antialiased">
        {children}
      </body>
    </html>
  );
}
