import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Philly Morning Bulletin | Philadelphia News",
  description:
    "Your daily briefing on Philadelphia news from local sources including the Inquirer, WHYY, Billy Penn, Philadelphia Tribune, and more.",
  openGraph: {
    title: "Philly Morning Bulletin",
    description: "Your daily briefing on Philadelphia news",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
