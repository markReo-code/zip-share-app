import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zip Share",
  description: "登録不要で、すぐにファイルを共有。最大500MBまでアップロード可能。無料・有効期限つきで安全に送信できます。",
  openGraph: {
    title: "Zip Share",
    description: "登録不要で、すぐにファイルを共有。最大500MBまでアップロード可能。無料・有効期限つきで安全に送信できます。",
    url: "https://zip-share-app.mark-reo.workers.dev",
    siteName: "Zip Share",
    images: [
      {
        url: "https://zip-share-app.mark-reo.workers.dev/eyecatch.jpg",
        width: 1200,
        height: 630,
        alt: "Zip Share"
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Zip Share",
    description: "登録不要で、すぐにファイルを共有。最大500MBまでアップロード可能。無料・有効期限つきで安全に送信できます。",
    images: ["https://zip-share-app.mark-reo.workers.dev/eyecatch.jpg"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
