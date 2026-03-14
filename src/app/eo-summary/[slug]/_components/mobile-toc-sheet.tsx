"use client";

import { useState } from "react";
import { List } from "lucide-react";
import { type DocumentArtifact } from "~/generated/prisma/client";
import { getArtifactStyle } from "~/lib/document-utils";
import { Button } from "~/app/_components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/app/_components/ui/sheet";

interface MobileTocSheetProps {
  artifacts: DocumentArtifact[];
  onSectionClick: (title: string) => void;
}

export function MobileTocSheet({
  artifacts,
  onSectionClick,
}: MobileTocSheetProps) {
  const [open, setOpen] = useState(false);

  const handleItemClick = (title: string) => {
    onSectionClick(title);
    setOpen(false);

    const sectionId = title.toLowerCase().replace(/\s+/g, "-");
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg md:hidden"
            aria-label="Open section navigator"
          >
            <List className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[70vh] md:hidden">
          <SheetHeader>
            <SheetTitle>Sections</SheetTitle>
          </SheetHeader>
          <nav className="mt-4 flex flex-col gap-1 overflow-y-auto">
            {artifacts.map((artifact) => {
              const style = getArtifactStyle(artifact.title);
              const ArtifactIcon = style.icon;
              return (
                <button
                  key={artifact.id}
                  onClick={() => handleItemClick(artifact.title)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-muted"
                >
                  <ArtifactIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{artifact.title}</span>
                </button>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
