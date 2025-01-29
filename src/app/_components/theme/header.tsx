"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="mb-12 mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold sm:text-4xl">
          <Link href="/">
            <span>Unfiltered</span>
          </Link>
        </h1>
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-4 md:flex">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <nav className="mt-4 flex flex-col gap-2 md:hidden">
          <Link
            href="/"
            className="rounded-md p-2 hover:bg-accent"
            onClick={toggleMenu}
          >
            Home
          </Link>
          <Link
            href="/about"
            className="rounded-md p-2 hover:bg-accent"
            onClick={toggleMenu}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="rounded-md p-2 hover:bg-accent"
            onClick={toggleMenu}
          >
            Contact
          </Link>
        </nav>
      )}
    </header>
  );
}
