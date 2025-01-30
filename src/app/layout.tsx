import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "next-themes";

import { Analytics } from "@vercel/analytics/react";
import Header from "~/components/theme/header";
import Footer from "./_components/theme/footer";
import { Toaster } from "./_components/ui/sonner";

export const metadata: Metadata = {
  title: {
    template: "%s | Slak.me",
    default: "Slak.me Executive Order Analysis",
  },
  description: "Deep analysis of political orders",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
            <div className="mx-6 flex h-screen max-w-screen-xl flex-col justify-between md:mx-12 xl:mx-auto">
              <Header />
              <main className="mx-auto">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </TRPCReactProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
