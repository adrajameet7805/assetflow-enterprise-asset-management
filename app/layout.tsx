import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AssetFlow - Enterprise Asset Management",
  description: "Enterprise Asset & Resource Management System — Premium SaaS",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {user ? (
            <div className="flex min-h-screen">
              <Sidebar dbRole={user.dbRole} userEmail={user.email ?? ""} userName={user.user_metadata?.name ?? null} />
              <div className="flex-1 flex flex-col min-w-0 ml-64">
                <TopNav user={{ dbRole: user.dbRole, email: user.email, name: user.user_metadata?.name }} />
                <main className="flex-1 p-6 lg:p-8 overflow-auto">
                  {children}
                </main>
              </div>
            </div>
          ) : (
            <main>{children}</main>
          )}
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "#111827",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#F8FAFC",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
