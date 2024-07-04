"use client"

import React from "react";
import TranscriptionsPage from "./deepgram/page";
import { ContextProvider } from "@/components/contexts/contextProvider";
import { useSession, signIn, signOut } from "next-auth/react";

const Home = () => {
  const { data: session, status } = useSession();

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
    <ContextProvider>
      <MainComponent />
    </ContextProvider>
  );
};

const MainComponent = () => {
  return (
    <main>
      <div className="bg-black font-sans">
        <TranscriptionsPage />
      </div>
    </main>
  );
};

export default Home;
