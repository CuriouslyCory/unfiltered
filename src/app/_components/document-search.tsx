"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { RiskScore } from "./risk-score";
import { DocumentTypeBadge } from "./document-type-badge";
import { api } from "~/trpc/react";

export function DocumentSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results } = api.document.search.useQuery(
    { query: debouncedQuery },
    {
      enabled: debouncedQuery.length > 0,
    },
  );

  const displayResults = results?.slice(0, 30) ?? [];
  const showDropdown = isOpen && debouncedQuery.length > 0;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateToResult = useCallback(
    (slug: string) => {
      setIsOpen(false);
      setQuery("");
      router.push(`/eo-summary/${slug}?sections=ELI5`);
    },
    [router],
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || displayResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < displayResults.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : displayResults.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && displayResults[activeIndex]) {
          navigateToResult(displayResults[activeIndex].slug);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [displayResults.length]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search documents..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-9"
          aria-label="Search documents"
          aria-expanded={showDropdown}
          aria-controls="search-results"
          aria-activedescendant={
            activeIndex >= 0 ? `search-result-${activeIndex}` : undefined
          }
          role="combobox"
          autoComplete="off"
        />
      </div>

      {showDropdown && (
        <div
          id="search-results"
          role="listbox"
          className="absolute z-50 mt-1 max-h-96 w-full overflow-y-auto rounded-md border bg-popover shadow-lg"
        >
          {displayResults.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No documents found
            </div>
          ) : (
            displayResults.map((doc, index) => (
              <button
                key={doc.id}
                id={`search-result-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors ${
                  index === activeIndex
                    ? "bg-accent"
                    : "hover:bg-accent/50"
                } ${index > 0 ? "border-t border-border" : ""}`}
                onClick={() => navigateToResult(doc.slug)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <RiskScore score={doc.riskScore} className="mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {doc.title}
                    </span>
                  </div>
                  {doc.shortSummary && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {doc.shortSummary}
                    </p>
                  )}
                </div>
                <DocumentTypeBadge
                  type={doc.type}
                  className="mt-0.5 flex-shrink-0"
                />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
