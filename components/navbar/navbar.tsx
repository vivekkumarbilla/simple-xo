import { NavbarMobile } from "@/components/navbar/navbar-mobile";
import { buttonVariants } from "@/components/ui/button";
import { Dice3Icon } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

export const NavBar: FC = () => {
  return (
    <>
      <div className="animate-in fade-in w-full">
        <nav className="container px-6 md:px-8 py-4">
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="flex items-center">
                <Dice3Icon className="w-8 h-8 mr-2 inline" />{" "}
                <span className="text-xl font-semibold tracking-tighter text-slate-800 mr-6">
                  Tic Tac Toe
                </span>
              </div>
            </Link>
            <div className="hidden md:flex justify-end grow">
              <div>
                <Link href="/about" className={buttonVariants({ variant: "link" })}>
                  About
                </Link>
                <Link href="/help" className={buttonVariants({ variant: "link" })}>
                  Help
                </Link>
                <Link href="/contact" className={buttonVariants({ variant: "link" })}>
                  Contact
                </Link>
              </div>
            </div>
            <div className="grow md:hidden flex justify-end">
              <NavbarMobile />
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};