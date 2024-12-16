"use client";
import { NavBar } from "@/components/navbar/navbar";
import { initializeApp, FirebaseOptions } from "firebase/app";
import { ReactNode, useEffect, useState } from "react";
import { config } from "@/lib/utils";

export default function MainLayout({ children }: { children: ReactNode }) {
  const [firebaseApp, setFirebaseApp] = useState(false);
  useEffect(() => {
    if (!firebaseApp) {
      initializeApp(config);
      setFirebaseApp(true);
    }
  })
  return (
    <div className="flex flex-col min-h-screen animate-in fade-in">
      <NavBar />
      <div className="flex flex-col grow h-full pt-12">{children}</div>
      <footer>
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose md:text-left">
              Made by {" "}
              <a href="https://vivekbilla.in" target="_blank" className="font-medium underline underline-offset-4" >
                Vivek Billa
              </a>{" "}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
