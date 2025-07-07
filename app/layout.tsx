import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookOpen } from "lucide-react";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | Question Banks',
    default: 'Question Bank - Manage Your Questions'
  },
  description: 'Create, manage, and explore questions easily with our intuitive question bank application.',
  openGraph: {
    title: 'Question Bank',
    description: 'Your personal question management system',
    type: 'website'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Static Header always on top */}
          <header
            className="sticky top-0 z-50 w-full border-b"
            style={{
              backgroundColor: "hsl(var(--background) / 0.95)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
              <div className="flex items-center space-x-2">
                <BookOpen
                  className="h-6 w-6"
                  style={{ color: "hsl(var(--primary))" }}
                />
                <span
                  className="font-bold text-xl"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  Question Bank
                </span>
              </div>
              <Suspense fallback={<div className="w-10 h-10" />}> {/* fallback for ThemeToggle */}
                <ThemeToggle />
              </Suspense>
            </div>
          </header>
          {/* Main Content */}
          <main
            className="min-h-[90vh] flex items-center justify-center bg-background p-6"
            style={{
              background:
                "linear-gradient(to bottom, hsl(var(--background)), hsl(var(--muted) / 0.3))",
            }}
          >
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
