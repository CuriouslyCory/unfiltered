"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { type DocumentArtifact } from "~/generated/prisma/client";
import { type DocumentType } from "~/generated/prisma/client";
import { ArtifactSection } from "./artifact-section";
import { TableOfContents } from "./table-of-contents";
import { Button } from "~/app/_components/ui/button";
import { MobileTocSheet } from "./mobile-toc-sheet";

interface ArtifactSectionListProps {
  artifacts: DocumentArtifact[];
  initialOpenSections: string[];
  documentTitle: string;
  riskScore: number | null;
  documentType: DocumentType;
}

export function ArtifactSectionList({
  artifacts,
  initialOpenSections,
  documentTitle,
  riskScore,
  documentType,
}: ArtifactSectionListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    const sections = searchParams.get("sections");
    if (sections === "all") {
      return new Set(artifacts.map((a) => a.title));
    }
    return new Set(initialOpenSections);
  });

  const updateUrl = useCallback(
    (newOpen: Set<string>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newOpen.size === 0) {
        params.delete("sections");
      } else if (newOpen.size === artifacts.length) {
        params.set("sections", "all");
      } else {
        params.set("sections", Array.from(newOpen).join(","));
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, artifacts.length, router, pathname],
  );

  const handleToggle = useCallback(
    (title: string, open: boolean) => {
      setOpenSections((prev) => {
        const next = new Set(prev);
        if (open) {
          next.add(title);
        } else {
          next.delete(title);
        }
        updateUrl(next);
        return next;
      });
    },
    [updateUrl],
  );

  const handleExpandAll = () => {
    const all = new Set(artifacts.map((a) => a.title));
    setOpenSections(all);
    updateUrl(all);
  };

  const handleCollapseAll = () => {
    const none = new Set<string>();
    setOpenSections(none);
    updateUrl(none);
  };

  const handleOpenSection = useCallback(
    (title: string) => {
      if (!openSections.has(title)) {
        handleToggle(title, true);
      }
    },
    [openSections, handleToggle],
  );

  return (
    <div className="md:grid md:grid-cols-[200px_1fr] md:gap-6">
      <TableOfContents
        artifacts={artifacts}
        riskScore={riskScore}
        documentType={documentType}
        onSectionClick={handleOpenSection}
      />
      <div className="flex flex-col gap-y-8">
        <div className="flex gap-x-2">
          <Button variant="outline" size="sm" onClick={handleExpandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={handleCollapseAll}>
            Collapse All
          </Button>
        </div>
        {artifacts.map((artifact) => (
          <ArtifactSection
            key={artifact.id}
            artifact={artifact}
            isOpen={openSections.has(artifact.title)}
            onToggle={(open) => handleToggle(artifact.title, open)}
            documentTitle={documentTitle}
          />
        ))}
      </div>
      <MobileTocSheet
        artifacts={artifacts}
        onSectionClick={handleOpenSection}
      />
    </div>
  );
}
