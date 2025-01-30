"use client";

import { type DocumentArtifact } from "@prisma/client";
import { ChevronsUpDown, Link as LinkIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Button } from "~/components/ui/button";
import { markdownComponents } from "~/app/_components/markdown-components";

interface ArtifactSectionProps {
  artifact: DocumentArtifact;
  isOpen?: boolean;
}

export function ArtifactSection({
  artifact,
  isOpen = false,
}: ArtifactSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(isOpen);

  // Update URL when section is toggled
  useEffect(() => {
    const currentSections = searchParams.get("sections")?.split(",") ?? [];
    const newSections = isCollapsibleOpen
      ? [...new Set([...currentSections, artifact.title])]
      : currentSections.filter((section) => section !== artifact.title);

    const params = new URLSearchParams(searchParams);
    if (newSections.length > 0) {
      params.set("sections", newSections.join(","));
    } else {
      params.delete("sections");
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [isCollapsibleOpen, artifact.title, router, searchParams]);

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.hash = `#${artifact.title.toLowerCase().replace(/\s+/g, "-")}`;
    url.searchParams.set("sections", artifact.title);
    void navigator.clipboard.writeText(url.toString());
    toast.success("Link copied to clipboard");
  };

  return (
    <Collapsible
      open={isCollapsibleOpen}
      onOpenChange={setIsCollapsibleOpen}
      id={artifact.title.toLowerCase().replace(/\s+/g, "-")}
    >
      <CollapsibleTrigger className="w-full">
        <div className="mb-4 flex items-center justify-start">
          <div className="flex items-center gap-x-2">
            <ChevronsUpDown className="h-4 w-4" />
            <h2 className="text-lg font-bold">{artifact.title}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyLink();
            }}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="rounded-md border bg-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {artifact.content}
          </Markdown>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
