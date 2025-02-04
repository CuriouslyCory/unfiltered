"use client";
import { type DocumentArtifact } from "@prisma/client";
import Markdown, { type Components } from "react-markdown";
import { markdownComponents } from "~/app/_components/markdown-components";
import { useState, useRef, useEffect } from "react";

export default function UpdatesSection({
  updates,
}: {
  updates: DocumentArtifact | undefined;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isContentClipped, setIsContentClipped] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkContentHeight = () => {
      if (contentRef.current) {
        const isClipped =
          contentRef.current.scrollHeight > contentRef.current.clientHeight;
        setIsContentClipped(isClipped);
      }
    };

    checkContentHeight();
    // Re-check when content changes
    window.addEventListener("resize", checkContentHeight);
    return () => window.removeEventListener("resize", checkContentHeight);
  }, [updates?.content]);

  const components: Components = {
    ...markdownComponents,
    ul: (props) => <ul className="mt-2" {...props} />,
    a: (props) => (
      <a className="text-blue-600 hover:underline" {...props} target="_blank" />
    ),
  };

  return (
    <section className="flex flex-col rounded-md border bg-white/5 p-6">
      <h2 className="text-lg font-bold">Updates</h2>
      <div
        ref={contentRef}
        className={`relative ${!isExpanded ? "max-h-40 overflow-hidden" : ""}`}
      >
        <Markdown components={components}>{updates?.content ?? ""}</Markdown>
        {!isExpanded && isContentClipped && (
          <div className="absolute bottom-0 left-0 right-0 h-12" />
        )}
      </div>
      {isContentClipped && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          {isExpanded ? "Show less" : "See more"}
        </button>
      )}
    </section>
  );
}
