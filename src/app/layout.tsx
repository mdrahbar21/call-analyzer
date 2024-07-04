"use client"

import React from "react";
import { Inter } from 'next/font/google';
import Sidebar from "@/components/sidebar/side";
import Navbar from "@/components/navigation/navbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/themeProvider";
import { ContextProvider, AppStateContext } from "@/components/contexts/contextProvider";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <ContextProvider>
          <MainComponent children={children} />
      </ContextProvider>
    </SessionProvider>
  );
}

const MainComponent = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { activeMenu } = AppStateContext();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} bg-black font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <div className="flex relative dark:bg-main-dark-bg">
              {activeMenu && (
                <div className={`w-72 sidebar dark:bg-secondary-dark-bg`}>
                  <Sidebar />
                </div>
              )}
              <div
                className={`dark:bg-main-bg bg-main-bg min-h-screen w-full ${activeMenu ? 'md:ml-72' : 'flex-2'}`}
              >
                <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
                  <Navbar />
                </div>
                <div className="content">
                  {children}
                </div>
              </div>
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
