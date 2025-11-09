import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ThemeProvider,
  AnalyticsProvider,
  QueryProvider,
} from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { AuthDebugPanel } from "@/components/debug/auth-debug";
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
  title: "Eagle Dashboard",
  description: "Modern dashboard for Eagle Investors",
};

// app/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AnalyticsProvider
              enabled={
                process.env.NODE_ENV === "production" ||
                process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true"
              }
            >
              {children}
              <Toaster position="top-right" richColors />
              <AuthDebugPanel />
            </AnalyticsProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
