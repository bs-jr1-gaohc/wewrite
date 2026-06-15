import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "WeWrite — 公众号文章云端工具",
  description: "一句话生成、排版、推送公众号文章。零部署，打开即用。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="topbar">
          <div className="brand">
            We<span>Write</span> · 公众号云端工具
          </div>
          <nav className="navlinks">
            <Link href="/">写文章</Link>
            <Link href="/settings">设置</Link>
          </nav>
        </div>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
