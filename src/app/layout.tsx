import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingHeartsBackground from "@/components/FloatingHeartsBackground";
import MangaCat from "@/components/MangaCat";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LoveSpace - 我们的专属恋爱空间",
  description: "记录我们点点滴滴的温馨小站",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  // Simple role detection: if user_id exists, assume ADMIN/User, else GUEST
  const role = userId ? "ADMIN" : "GUEST";

  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen`}
      >
        <FloatingHeartsBackground />
        <div className="relative z-10">
          {children}
        </div>
        <MangaCat role={role} />
      </body>
    </html>
  );
}
