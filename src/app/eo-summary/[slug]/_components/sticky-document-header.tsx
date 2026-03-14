"use client";

import { useState, useEffect, useRef } from "react";
import { RiskScore } from "~/components/risk-score";
import { getArtifactStyle } from "~/lib/document-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/app/_components/ui/button";
import { ChevronDown } from "lucide-react";

interface StickyDocumentHeaderProps {
  title: string;
  riskScore: number | null;
  sectionTitles: string[];
}

export function StickyDocumentHeader({
  title,
  riskScore,
  sectionTitles,
}: StickyDocumentHeaderProps) {
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const titleEl = document.getElementById("document-title");
    if (!titleEl) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setVisible(!entry.isIntersecting);
        }
      },
      { threshold: 0 },
    );

    observerRef.current.observe(titleEl);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleJumpToSection = (sectionTitle: string) => {
    const sectionId = sectionTitle.toLowerCase().replace(/\s+/g, "-");
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const truncatedTitle =
    title.length > 60 ? title.slice(0, 60) + "\u2026" : title;

  return (
    <div
      className={`fixed left-0 right-0 top-0 z-40 border-b bg-background/95 px-4 py-2 backdrop-blur transition-all duration-200 md:block ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-full opacity-0"
      } hidden`}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <RiskScore score={riskScore} />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
          {truncatedTitle}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0">
              Jump to section
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sectionTitles.map((sectionTitle) => {
              const style = getArtifactStyle(sectionTitle);
              const Icon = style.icon;
              return (
                <DropdownMenuItem
                  key={sectionTitle}
                  onClick={() => handleJumpToSection(sectionTitle)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {sectionTitle}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
