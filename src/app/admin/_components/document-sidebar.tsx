"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { type Document, type DocumentArtifact } from "~/generated/prisma/client";
import { ChevronDown, ChevronRight, FileText, Loader2, Play, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/app/_components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/app/_components/ui/tooltip";
import {
  artifactOrder,
  artifactSectionId,
  calculateDocumentHealth,
  deprecatedArtifacts,
  getArtifactStyle,
  type HealthScoreResult,
} from "~/lib/document-utils";
import { env } from "~/env";

interface DocumentSidebarProps {
  document: Document & { documentArtifact: DocumentArtifact[] };
}

function getHealthColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function getHealthStrokeColor(score: number): string {
  if (score >= 80) return "stroke-green-500";
  if (score >= 60) return "stroke-yellow-500";
  if (score >= 40) return "stroke-orange-500";
  return "stroke-red-500";
}

function HealthRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="shrink-0">
      <circle
        cx="44"
        cy="44"
        r={radius}
        fill="none"
        strokeWidth="6"
        className="stroke-muted"
      />
      <circle
        cx="44"
        cy="44"
        r={radius}
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={`${getHealthStrokeColor(score)} transition-all duration-500`}
        transform="rotate(-90 44 44)"
      />
      <text
        x="44"
        y="44"
        textAnchor="middle"
        dominantBaseline="central"
        className={`fill-current text-lg font-bold ${getHealthColor(score)}`}
      >
        {score}%
      </text>
    </svg>
  );
}

function CategoryBreakdown({
  label,
  category,
}: {
  label: string;
  category: HealthScoreResult["breakdown"]["requiredFields"];
}) {
  const percentage = category.max > 0 ? (category.score / category.max) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {category.score}/{category.max}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className="h-1.5 rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {category.missing.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Missing: {category.missing.join(", ")}
        </div>
      )}
    </div>
  );
}

const artifactRouteMap: Record<string, string> = {
  "ELI5": "/document/eli5",
  "Key Points": "/document/key-points",
  "Constitutional Considerations": "/document/constitutional-considerations",
  "Take Action": "/document/action-plan",
  "Social Post": "/document/social-post",
  "Letter of Concern": "/document/resist-letter",
  "Risk Score Details": "/document/score",
  "Final Summary": "/document/final-summary",
};

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function DocumentSidebar({ document: doc }: DocumentSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [generating, setGenerating] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const router = useRouter();

  async function generateArtifact(title: string, route: string) {
    setGenerating((prev) => new Set(prev).add(title));
    try {
      const url = `${env.NEXT_PUBLIC_WORKFLOW_API_URL}${route}?documentId=${doc.id}`;
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to generate ${title}`);
      }
      toast.success(`${title} generation started`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to generate ${title}`);
    } finally {
      setGenerating((prev) => {
        const next = new Set(prev);
        next.delete(title);
        return next;
      });
    }
  }

  async function generateAllMissing() {
    setGenerating((prev) => new Set([...prev, "__all__"]));
    try {
      const url = `${env.NEXT_PUBLIC_WORKFLOW_API_URL}/document/run-all?documentId=${doc.id}`;
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to generate all artifacts");
      }
      toast.success("All artifact generation started");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate all artifacts");
    } finally {
      setGenerating((prev) => {
        const next = new Set(prev);
        next.delete("__all__");
        return next;
      });
    }
  }

  const health = calculateDocumentHealth(doc);
  const presentTitles = new Set(doc.documentArtifact.map((a) => a.title));

  // Build nav items: ordered artifacts (skip deprecated unless present) + extra unknown artifacts
  const orderedNavItems = artifactOrder.filter(
    (title) => !deprecatedArtifacts.has(title) || presentTitles.has(title),
  );
  const artifactOrderSet = new Set(artifactOrder);
  const extraNavItems = doc.documentArtifact
    .filter((a) => !artifactOrderSet.has(a.title))
    .map((a) => a.title);
  const navItems = [...orderedNavItems, ...extraNavItems];

  useEffect(() => {
    const sectionIds = [
      "document-details",
      ...navItems
        .filter((title) => presentTitles.has(title))
        .map((title) => artifactSectionId(title)),
    ];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.documentArtifact]);

  return (
    <div className="space-y-4">
      <Card>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer p-4">
              <div className="flex items-center gap-3">
                <HealthRing score={health.score} />
                <div className="flex flex-1 items-center justify-between">
                  <CardTitle className="text-sm">Completeness</CardTitle>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3 px-4 pb-4 pt-0">
              <CategoryBreakdown
                label="Required Fields"
                category={health.breakdown.requiredFields}
              />
              <CategoryBreakdown
                label="Optional Fields"
                category={health.breakdown.optionalFields}
              />
              <CategoryBreakdown
                label="Artifacts"
                category={health.breakdown.artifacts}
              />
              <CategoryBreakdown
                label="Published"
                category={health.breakdown.published}
              />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Navigation</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <nav className="space-y-0.5">
            <button
              onClick={() => scrollToSection("document-details")}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-all duration-150 ${
                activeSection === "document-details"
                  ? "border-l-2 border-primary bg-muted/50 pl-1.5"
                  : "hover:bg-muted"
              }`}
            >
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>Document Details</span>
            </button>
            {navItems.map((title) => {
              const style = getArtifactStyle(title);
              const ArtifactIcon = style.icon;
              const isPresent = presentTitles.has(title);
              const route = artifactRouteMap[title];
              const isDeprecated = deprecatedArtifacts.has(title);
              const isGenerating = generating.has(title);

              return (
                <div key={title} className="flex items-center">
                  <button
                    onClick={() =>
                      isPresent &&
                      scrollToSection(artifactSectionId(title))
                    }
                    className={`flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-all duration-150 ${
                      !isPresent
                        ? "cursor-default opacity-50"
                        : activeSection === artifactSectionId(title)
                          ? "border-l-2 border-primary bg-muted/50 pl-1.5"
                          : "hover:bg-muted"
                    }`}
                  >
                    <ArtifactIcon
                      className={`h-4 w-4 ${style.borderClass.replace("border-", "text-")}`}
                    />
                    <span className="flex-1 truncate">{title}</span>
                  </button>
                  {isPresent && route && !isDeprecated ? (
                    isGenerating ? (
                      <div className="ml-1 flex w-5 shrink-0 items-center justify-center">
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => void generateArtifact(title, route)}
                              className="group/regen ml-1 flex w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                            >
                              <span className="block h-2 w-2 rounded-full bg-green-500 group-hover/regen:hidden" />
                              <RefreshCw className="hidden h-3 w-3 group-hover/regen:block" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Regenerate</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  ) : isPresent ? (
                    <div className="ml-1 flex w-5 shrink-0 items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                  ) : isDeprecated ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            disabled
                            className="ml-1 flex w-5 shrink-0 items-center justify-center rounded text-muted-foreground opacity-50"
                          >
                            <Play className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Deprecated</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : route ? (
                    <button
                      onClick={() => generateArtifact(title, route)}
                      disabled={isGenerating}
                      className="ml-1 flex w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-50"
                      title={`Generate ${title}`}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </button>
                  ) : (
                    <div className="ml-1 flex w-5 shrink-0 items-center justify-center">
                      <span className="h-2 w-2 rounded-full border border-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
            {health.breakdown.artifacts.missing.length > 0 && (
              <button
                onClick={() => void generateAllMissing()}
                disabled={generating.has("__all__")}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-muted-foreground/50 px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-50"
              >
                {generating.has("__all__") ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Generate All Missing
              </button>
            )}
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}
