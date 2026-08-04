import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AI+游戏玩法常态化监控 | 情报看板",
  description: "AI 游戏产品数据库——玩法分类、真实数据与趋势洞察的常态化追踪。",
  openGraph: {
    type: "website",
    siteName: "AI+游戏玩法常态化监控",
    title: "AI+游戏玩法常态化监控 | 情报看板",
    description: "AI 游戏产品数据库——玩法分类、真实数据与趋势洞察的常态化追踪。",
    url: SITE_URL,
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI+游戏玩法常态化监控 | 情报看板",
    description: "AI 游戏产品数据库——玩法分类、真实数据与趋势洞察的常态化追踪。",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
