import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { Geist, Geist_Mono } from "next/font/google";
import ConvexClientProvider from "@/components/convex-client-provider";

import { BaseTheme } from "@clerk/types";

import "@/app/globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeChangeButton } from "@/components/theme-change-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Hiruko",
    default: "Hiruko",
  },
  keywords: ["Hiruko", "Finance Tracker"],
  description: "Hiruko is your personal finance tracker and consultant",
  icons: { icon: "/icons/favicon.ico", apple: "/icons/apple-touch-icon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider
          appearance={{
            baseTheme: shadcn as BaseTheme,
          }}
        >
          <ConvexClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <ThemeChangeButton className="fixed bottom-6 left-6" />
            </ThemeProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
