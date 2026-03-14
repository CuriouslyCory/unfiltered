import Link from "next/link";
import { CoffeeIcon } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <p className="font-serif text-lg font-bold">Slak.me</p>
            <p className="text-sm text-muted-foreground">
              Independent Executive Order Analysis
            </p>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Tracking constitutional risk and civic impact of executive orders,
            legislation, and government actions.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link
              href="https://buymeacoffee.com/curiouslycory"
              className="flex items-center gap-2"
            >
              <CoffeeIcon className="h-5 w-5" />
              Buy me a coffee
            </Link>
          </Button>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between">
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </nav>
          <p className="text-xs text-muted-foreground">
            Nothing on Slak.me is intended to constitute legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
