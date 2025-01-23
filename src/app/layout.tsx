import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "next-themes";

import { Analytics } from "@vercel/analytics/react";
import Header from "~/components/theme/header";
import Footer from "./_components/theme/footer";

export const metadata: Metadata = {
  title: "Unfiltered Executive Order Analysis",
  description: "Critical analysis of executive orders",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <div className="mx-auto flex h-screen flex-col justify-between md:mx-10 lg:mx-20">
              <Header />
              <main className="mb-auto">{children}</main>
              <Footer />
            </div>
          </TRPCReactProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
