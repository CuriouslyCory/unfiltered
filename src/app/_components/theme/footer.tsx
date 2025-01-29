import Link from "next/link";
import { CoffeeIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mb-2 mt-4 flex flex-col items-center justify-center">
      <div className="flex w-full items-center justify-center">
        <span className="">
          Nothing on Unfiltered is intended to constitute legal advice.
        </span>
        <nav className="ml-auto flex items-center gap-4 text-gray-600 dark:text-gray-400">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link
            href="https://buymeacoffee.com/curiouslycory"
            className="flex items-center gap-x-2"
          >
            <CoffeeIcon className="h-6 w-6" /> Buy me a coffee
          </Link>
        </nav>
      </div>
    </footer>
  );
}
