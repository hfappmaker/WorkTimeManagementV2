import type { Metadata } from "next";
import { Roboto_Mono as Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";
import { TransitionProvider } from "@/contexts/TransitionContext";

import ClientLayout from "./client-layout";

const mono = Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | 勤怠管理システム",
    default: "勤怠管理システム",
  },
  description:
    "勤怠管理システム",
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon.ico",
        sizes: "16x16",
        type: "image/x-icon",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={mono.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientLayout>
            <TransitionProvider>
              {children}
              <Toaster
                richColors
                closeButton
              />
            </TransitionProvider>
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
