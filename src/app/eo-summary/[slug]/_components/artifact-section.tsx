"use client";

import { type DocumentArtifact } from "~/generated/prisma/client";
import {
  ChevronsUpDown,
  Link as LinkIcon,
  Copy,
  Send,
  ShareIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import {
  BlueskyShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  RedditShareButton,
  BlueskyIcon,
  LinkedinIcon,
  TelegramIcon,
  RedditIcon,
} from "react-share";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { markdownComponents } from "~/app/_components/markdown-components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { getArtifactStyle } from "~/lib/document-utils";

interface ArtifactActionsProps {
  artifact: DocumentArtifact;
  onCopyLink: () => void;
  onCopyContent: () => void;
  documentTitle: string;
  className?: string;
}

function ArtifactActions({
  artifact,
  onCopyLink,
  onCopyContent,
  documentTitle,
  className,
}: ArtifactActionsProps) {
  const shareUrl = useMemo(
    () =>
      typeof window !== "undefined" && window?.location?.href
        ? window?.location?.href
        : "",
    [],
  );

  const handleResistBot = () => {
    // Example URL - you can customize this based on your needs
    const resistBotUrl = `https://t.me/resistbot`;
    window.open(resistBotUrl, "_blank");
  };

  // Common actions that appear for all artifacts
  const commonActions = (
    <>
      <button
        type="button"
        className="cursor-pointer hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        onClick={(e) => {
          e.stopPropagation();
          onCopyLink();
        }}
        aria-label="Copy link to section"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="cursor-pointer hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        onClick={(e) => {
          e.stopPropagation();
          onCopyContent();
        }}
        aria-label="Copy content"
      >
        <Copy className="h-4 w-4" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Share" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">
          <ShareIcon size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-12 min-w-12">
          <DropdownMenuLabel>
            <BlueskyShareButton url={shareUrl} title={documentTitle}>
              <BlueskyIcon size={20} round />
            </BlueskyShareButton>
          </DropdownMenuLabel>

          <DropdownMenuLabel>
            <LinkedinShareButton
              url={shareUrl}
              title={documentTitle}
              summary={artifact.content}
              source={shareUrl}
            >
              <LinkedinIcon size={20} round />
            </LinkedinShareButton>
          </DropdownMenuLabel>

          <DropdownMenuLabel>
            <TelegramShareButton url={shareUrl} title={documentTitle}>
              <TelegramIcon size={20} round />
            </TelegramShareButton>
          </DropdownMenuLabel>

          <DropdownMenuLabel>
            <RedditShareButton url={shareUrl} title={documentTitle}>
              <RedditIcon size={20} round />
            </RedditShareButton>
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  // Additional actions based on artifact type
  const getTypeSpecificActions = () => {
    const title = artifact.title.toLowerCase();

    if (title.includes("social post") || title.includes("social media")) {
      // return <></>;
    }

    if (title.includes("letter") || title.includes("concern")) {
      return (
        <button
          type="button"
          className="cursor-pointer hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          onClick={(e) => {
            e.stopPropagation();
            handleResistBot();
          }}
          aria-label="Send via ResistBot"
        >
          <Send className="h-4 w-4" />
        </button>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border p-2 md:flex-col",
        className,
      )}
    >
      {commonActions}
      {getTypeSpecificActions()}
    </div>
  );
}

interface ArtifactSectionProps {
  artifact: DocumentArtifact;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  documentTitle: string;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, "") // headings
    .replace(/\*\*(.+?)\*\*/g, "$1") // bold
    .replace(/\*(.+?)\*/g, "$1") // italic
    .replace(/__(.+?)__/g, "$1") // bold alt
    .replace(/_(.+?)_/g, "$1") // italic alt
    .replace(/~~(.+?)~~/g, "$1") // strikethrough
    .replace(/`(.+?)`/g, "$1") // inline code
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // links
    .replace(/!\[.*?\]\(.+?\)/g, "") // images
    .replace(/^\s*[-*+]\s+/gm, "") // list items
    .replace(/^\s*\d+\.\s+/gm, "") // ordered list items
    .replace(/^\s*>\s+/gm, "") // blockquotes
    .replace(/\n{2,}/g, " ") // multiple newlines
    .replace(/\n/g, " ") // single newlines
    .replace(/\s{2,}/g, " ") // multiple spaces
    .trim();
}

export function ArtifactSection({
  artifact,
  isOpen = false,
  onToggle,
  documentTitle,
}: ArtifactSectionProps) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const isCollapsibleOpen = onToggle !== undefined ? isOpen : internalOpen;
  const handleOpenChange = (open: boolean) => {
    if (onToggle) {
      onToggle(open);
    } else {
      setInternalOpen(open);
    }
  };
  const artifactStyle = getArtifactStyle(artifact.title);
  const ArtifactIcon = artifactStyle.icon;

  const previewText = useMemo(() => {
    const plain = stripMarkdown(artifact.content);
    return plain.length > 120 ? plain.slice(0, 120) + "…" : plain;
  }, [artifact.content]);

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.hash = `#${artifact.title.toLowerCase().replace(/\s+/g, "-")}`;
    url.searchParams.set("sections", artifact.title);
    void navigator.clipboard.writeText(url.toString());
    toast.success("Link copied to clipboard");
  };

  const handleCopyContent = () => {
    void navigator.clipboard.writeText(artifact.content);
    toast.success("Content copied to clipboard");
  };

  return (
    <Collapsible
      open={isCollapsibleOpen}
      onOpenChange={handleOpenChange}
      id={artifact.title.toLowerCase().replace(/\s+/g, "-")}
    >
      <CollapsibleTrigger className="w-full">
        <div className="mb-4 flex flex-col items-start gap-y-1">
          <div className="flex items-center justify-start gap-x-2">
            <ChevronsUpDown className="h-4 w-4" />
            <ArtifactIcon className="h-4 w-4" />
            <h2 className="text-start text-2xl font-bold">{artifact.title}</h2>
          </div>
          {!isCollapsibleOpen && (
            <p className="truncate text-sm text-muted-foreground pl-12 w-full text-start">
              {previewText}
            </p>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="CollapsibleContent">
        <div className="flex items-start justify-center gap-x-2">
          <div className={cn("w-full max-w-full overflow-x-auto rounded-md border border-l-4 bg-muted p-6", artifactStyle.borderClass)}>
            <ArtifactActions
              artifact={artifact}
              onCopyLink={handleCopyLink}
              onCopyContent={handleCopyContent}
              documentTitle={documentTitle}
              className="md:hidden"
            />
            <div className="prose prose-sm dark:prose-invert max-w-none break-words">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {artifact.content}
              </Markdown>
            </div>
          </div>
          <ArtifactActions
            artifact={artifact}
            onCopyLink={handleCopyLink}
            onCopyContent={handleCopyContent}
            documentTitle={documentTitle}
            className="hidden md:flex"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
