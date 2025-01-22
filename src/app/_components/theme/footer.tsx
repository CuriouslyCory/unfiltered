import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export default function Footer() {
  return (
    <footer className="mb-2 mt-4 flex flex-col items-center justify-center">
      <div className="flex w-full">
        <span className="font-bold">
          Nothing on this site constitutes legal advice.
        </span>
      </div>
      <div className="flex w-full items-center justify-center">
        <h1 className="font-bold">
          <Link href="/">
            <span>Unfiltered</span>
          </Link>
        </h1>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <ThemeToggle />
      </div>
    </footer>
  );
}
