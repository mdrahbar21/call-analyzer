"use client"

import React from "react";
import { Inter } from 'next/font/google';
// import Sidebar from "@/components/sidebar/side";
// import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/navigation/navbar";
import { ThemeProvider } from "@/components/themeProvider";
import { ContextProvider, AppStateContext } from "@/components/contexts/contextProvider";
import { SessionProvider,useSession, signIn } from "next-auth/react";
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
    <html lang="en">
      <head>
        <title>HoomanLabs</title>
      </head>
      <body className={`${inter.variable} bg-black font-sans`}>
        <SessionProvider>
          <ContextProvider>
              <MainComponent children={children} />
          </ContextProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

const MainComponent = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { data: session, status } = useSession();
  const { activeMenu } = AppStateContext();
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (

      <div className="flex min-h-screen items-center justify-center bg-black font-sans">
        <button onClick={() => signIn()} className="px-4 py-2 bg-blue-500 text-white rounded">
          Sign In
        </button>
      </div>

    );
  }

  return (
    
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex relative dark:bg-main-dark-bg">
              <div className={`dark:bg-main-bg bg-main-bg min-h-screen w-full`}>
                <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
                  <Navbar />
                </div>
                <div className="content">
                  {children}
                </div>
              </div>
            </div>
          {/* <TooltipProvider>
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
          </TooltipProvider> */}
        </ThemeProvider>

  );
}
