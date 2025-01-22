import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  return (
    <header className="mb-12 mt-4 flex items-center">
      <h1 className="text-4xl font-bold">
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
    </header>
  );
}
