import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "수안사 | 스터디 운영 관리",
  description: "수안사 회원을 위한 공식 스터디 일정 확인 및 등록 공간",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
