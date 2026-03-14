"use client";

import { useState } from "react";
import { type Document, type DocumentArtifact } from "~/generated/prisma/client";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/app/_components/ui/collapsible";
import {
  artifactOrder,
  artifactSectionId,
  calculateDocumentHealth,
  getArtifactStyle,
  type HealthScoreResult,
} from "~/lib/document-utils";

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

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function DocumentSidebar({ document: doc }: DocumentSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const health = calculateDocumentHealth(doc);
  const presentTitles = new Set(doc.documentArtifact.map((a) => a.title));

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
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
            >
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>Document Details</span>
            </button>
            {artifactOrder.map((title) => {
              const style = getArtifactStyle(title);
              const ArtifactIcon = style.icon;
              const isPresent = presentTitles.has(title);

              return (
                <button
                  key={title}
                  onClick={() =>
                    isPresent &&
                    scrollToSection(artifactSectionId(title))
                  }
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                    isPresent
                      ? "hover:bg-muted"
                      : "cursor-default opacity-50"
                  }`}
                >
                  <ArtifactIcon
                    className={`h-4 w-4 ${style.borderClass.replace("border-", "text-")}`}
                  />
                  <span className="flex-1 truncate">{title}</span>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      isPresent ? "bg-green-500" : "border border-muted-foreground"
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}
