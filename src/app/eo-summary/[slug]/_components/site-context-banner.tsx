"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";

const STORAGE_KEY = "slakme-banner-dismissed";

export function SiteContextBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const referrer = document.referrer;
    if (!referrer || !referrer.includes(window.location.hostname)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border bg-muted px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-sm text-muted-foreground">
          Slak.me provides independent analysis of executive orders and
          legislation.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Browse All Documents</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/about">About</Link>
          </Button>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss banner"
        className="shrink-0 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
