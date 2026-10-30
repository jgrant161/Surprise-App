import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "FlyerCal", template: "%s · FlyerCal" },
  description: "The family calendar that fills itself. Snap a school flyer or team schedule and every date lands on the right kid.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "FlyerCal", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  const showNav = !!session?.family;
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <div className={`mx-auto w-full max-w-2xl flex-1 px-4 pt-4 ${showNav ? "pb-24" : "pb-8"}`}>{children}</div>
        {showNav && <BottomNav />}
      </body>
    </html>
  );
}
