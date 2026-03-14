"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { type DocumentArtifact } from "~/generated/prisma/client";
import { type DocumentType } from "~/generated/prisma/client";
import { getArtifactStyle } from "~/lib/document-utils";
import { RiskScore } from "~/app/_components/risk-score";
import { DocumentTypeBadge } from "~/app/_components/document-type-badge";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "~/lib/utils";

interface TableOfContentsProps {
  artifacts: DocumentArtifact[];
  riskScore: number | null;
  documentType: DocumentType;
  onSectionClick: (title: string) => void;
}

export function TableOfContents({
  artifacts,
  riskScore,
  documentType,
  onSectionClick,
}: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the first intersecting entry
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          const topEntry = intersecting.reduce((prev, curr) =>
            prev.boundingClientRect.top < curr.boundingClientRect.top
              ? prev
              : curr,
          );
          // The id is the artifact title lowercased with spaces replaced by hyphens
          const title = topEntry.target.id;
          if (title) {
            // Convert back from id to title for matching
            setActiveSection(title);
          }
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      },
    );

    // Observe all artifact section elements
    artifacts.forEach((artifact) => {
      const id = artifact.title.toLowerCase().replace(/\s+/g, "-");
      const element = document.getElementById(id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });
  }, [artifacts]);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [setupObserver]);

  const handleClick = (artifact: DocumentArtifact) => {
    const id = artifact.title.toLowerCase().replace(/\s+/g, "-");
    onSectionClick(artifact.title);
    // Small delay to allow section to open before scrolling
    setTimeout(() => {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <nav
      className="sticky top-4 hidden self-start md:block"
      aria-label="Table of contents"
    >
      <div
        className={cn(
          "flex flex-col gap-y-3 rounded-md border bg-muted/50 p-3 transition-all",
          collapsed ? "w-12" : "w-[200px]",
        )}
      >
        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={collapsed ? "Expand table of contents" : "Collapse table of contents"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>

        {/* Badges */}
        {!collapsed && (
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <RiskScore score={riskScore} />
            <DocumentTypeBadge type={documentType} className="text-xs" />
          </div>
        )}

        {/* Section links */}
        <ul className="flex flex-col gap-y-1">
          {artifacts.map((artifact) => {
            const id = artifact.title.toLowerCase().replace(/\s+/g, "-");
            const isActive = activeSection === id;
            const style = getArtifactStyle(artifact.title);
            const Icon = style.icon;

            if (collapsed) {
              return (
                <li key={artifact.id}>
                  <button
                    type="button"
                    onClick={() => handleClick(artifact)}
                    className={cn(
                      "flex w-full items-center justify-center rounded-sm p-1 transition-colors",
                      isActive
                        ? "border-l-2 border-primary bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    title={artifact.title}
                    aria-label={`Jump to ${artifact.title}`}
                  >
                    <span className="text-muted-foreground">—</span>
                  </button>
                </li>
              );
            }

            return (
              <li key={artifact.id}>
                <button
                  type="button"
                  onClick={() => handleClick(artifact)}
                  className={cn(
                    "flex w-full items-center gap-x-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors",
                    isActive
                      ? "border-l-2 border-primary bg-accent font-medium text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                  aria-label={`Jump to ${artifact.title}`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{artifact.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
