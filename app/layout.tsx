import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Anonymous Group Brainstorming",
  description: "Collaborate and share ideas anonymously",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col min-h-screen">
            <header className="bg-background border-b">
              <div className="container flex items-center justify-between py-4">
                <Link href="/" className="font-bold text-2xl">
                  Brainstorm
                </Link>
                <nav>
                  <ul className="flex space-x-4">
                    <li>
                      <Link href="/sessions">Sessions</Link>
                    </li>
                    <li>
                      <Link href="/sessions/create">Create Session</Link>
                    </li>
                    <li>
                      <Link href="/dashboard">Dashboard</Link>
                    </li>
                  </ul>
                </nav>
                <div className="flex items-center space-x-4">
                  <ThemeSwitcher />
                  <HeaderAuth />
                </div>
              </div>
            </header>
            <main className="flex-1 container py-8">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
