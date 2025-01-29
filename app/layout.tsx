import type { Metadata } from "next";
import { Roboto_Mono as Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from 'react';
import Loading from './loading';

const mono = Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Auth V5 Toolkit",
    default: "Auth V5 Toolkit",
  },
  description:
    "A toolkit for building advanced custom authentication into your next.js app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="dark"
    >
      <body className={mono.className}>
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
      </body>
      <Toaster
        richColors
        closeButton
      />
    </html>
  );
}
