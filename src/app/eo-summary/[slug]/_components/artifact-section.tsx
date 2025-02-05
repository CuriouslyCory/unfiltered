"use client";

import { type DocumentArtifact } from "@prisma/client";
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
  EmailShareButton,
  EmailIcon,
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

interface ArtifactActionsProps {
  artifact: DocumentArtifact;
  onCopyLink: () => void;
  onCopyContent: () => void;
  documentTitle: string;
}

function ArtifactActions({
  artifact,
  onCopyLink,
  onCopyContent,
  documentTitle,
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
    const resistBotUrl = `https://resist.bot/?text=${encodeURIComponent(artifact.content)}`;
    window.open(resistBotUrl, "_blank");
  };

  // Common actions that appear for all artifacts
  const commonActions = (
    <>
      <div
        className="cursor-pointer hover:opacity-70"
        onClick={(e) => {
          e.stopPropagation();
          onCopyLink();
        }}
        title="Copy link to section"
      >
        <LinkIcon className="h-4 w-4" />
      </div>
      <div
        className="cursor-pointer hover:opacity-70"
        onClick={(e) => {
          e.stopPropagation();
          onCopyContent();
        }}
        title="Copy content"
      >
        <Copy className="h-4 w-4" />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger title="Share">
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
      // return (
      //   <div
      //     className="cursor-pointer hover:opacity-70"
      //     onClick={(e) => {
      //       e.stopPropagation();
      //       handleResistBot();
      //     }}
      //     title="Send via ResistBot"
      //   >
      //     <Send className="h-4 w-4" />
      //   </div>
      // );
    }

    return null;
  };

  return (
    <div className="flex flex-col items-start gap-y-2 rounded-md border p-2">
      {commonActions}
      {getTypeSpecificActions()}
    </div>
  );
}

interface ArtifactSectionProps {
  artifact: DocumentArtifact;
  isOpen?: boolean;
  documentTitle: string;
}

export function ArtifactSection({
  artifact,
  isOpen = false,
  documentTitle,
}: ArtifactSectionProps) {
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(isOpen);

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
      onOpenChange={setIsCollapsibleOpen}
      id={artifact.title.toLowerCase().replace(/\s+/g, "-")}
    >
      <CollapsibleTrigger className="w-full">
        <div className="mb-4 flex items-center justify-start gap-x-2">
          <div className="flex items-center justify-start gap-x-2">
            <ChevronsUpDown className="h-4 w-4" />
            <h2 className="text-start text-2xl font-bold">{artifact.title}</h2>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="CollapsibleContent">
        <div className="flex items-start justify-center gap-x-2">
          <div className="rounded-md border bg-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {artifact.content}
            </Markdown>
          </div>
          <ArtifactActions
            artifact={artifact}
            onCopyLink={handleCopyLink}
            onCopyContent={handleCopyContent}
            documentTitle={documentTitle}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
