import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bay 4 Dashboard — Valley View",
  description: "Bay 4 dashboard — Valley View warehouse DOCK50-DOCK72",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
