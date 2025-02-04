"use client";

import { type DocumentArtifact } from "@prisma/client";
import { ChevronsUpDown, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { markdownComponents } from "~/app/_components/markdown-components";

interface ArtifactSectionProps {
  artifact: DocumentArtifact;
  isOpen?: boolean;
}

export function ArtifactSection({
  artifact,
  isOpen = false,
}: ArtifactSectionProps) {
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(isOpen);

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
        <div className="mb-4 flex items-center justify-start gap-x-2">
          <div className="flex items-center gap-x-2">
            <ChevronsUpDown className="h-4 w-4" />
            <h2 className="text-2xl font-bold">{artifact.title}</h2>
          </div>
          <div
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyLink();
            }}
          >
            <LinkIcon className="h-4 w-4" />
          </div>
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
