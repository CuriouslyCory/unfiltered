import { type Document, type DocumentArtifact } from "~/generated/prisma/client";
import {
  BookOpen,
  ListChecks,
  AlertTriangle,
  Scale,
  Megaphone,
  Share2,
  Mail,
  ShieldAlert,
  FileText,
  type LucideIcon,
} from "lucide-react";

export type ArtifactStyle = {
  borderClass: string;
  icon: LucideIcon;
};

const artifactStyles: Record<string, ArtifactStyle> = {
  ELI5: { borderClass: "border-blue-400", icon: BookOpen },
  "Key Points": { borderClass: "border-slate-400", icon: ListChecks },
  "Areas of Concern": { borderClass: "border-orange-400", icon: AlertTriangle },
  "Constitutional Considerations": { borderClass: "border-red-400", icon: Scale },
  "Take Action": { borderClass: "border-green-500", icon: Megaphone },
  "Social Post": { borderClass: "border-indigo-400", icon: Share2 },
  "Letter of Concern": { borderClass: "border-amber-400", icon: Mail },
  "Risk Score Details": { borderClass: "border-red-500", icon: ShieldAlert },
  "Final Summary": { borderClass: "border-primary", icon: FileText },
};

const defaultArtifactStyle: ArtifactStyle = {
  borderClass: "border-border",
  icon: FileText,
};

export function getArtifactStyle(title: string): ArtifactStyle {
  return artifactStyles[title] ?? defaultArtifactStyle;
}

export const artifactOrder = [
  // "Updates",
  //"Honest Title",
  "ELI5",
  "Key Points",
  "Areas of Concern",
  "Constitutional Considerations",
  "Take Action",
  "Social Post",
  "Letter of Concern",
  "Risk Score Details",
  "Final Summary",
  // "Original Document",
];

export const deprecatedArtifacts = new Set(["Areas of Concern", "Final Summary"]);

export const RISK_RANGES: Record<string, [number, number]> = {
  low: [0, 2],
  moderate: [3, 4],
  elevated: [5, 6],
  high: [7, 8],
  severe: [9, 10],
};

export function getArtifactByTitle(
  document: Document & { documentArtifact: DocumentArtifact[] },
  title: string,
) {
  return document.documentArtifact.find((artifact) => artifact.title === title);
}

export function artifactSectionId(title: string): string {
  return `artifact-${title.toLowerCase().replace(/\s+/g, "-")}`;
}

type CategoryBreakdown = {
  filled: string[];
  missing: string[];
  score: number;
  max: number;
};

export type HealthScoreResult = {
  score: number;
  maxScore: 100;
  breakdown: {
    requiredFields: CategoryBreakdown;
    optionalFields: CategoryBreakdown;
    artifacts: CategoryBreakdown;
    published: CategoryBreakdown;
  };
};

export function calculateDocumentHealth(
  document: Document & { documentArtifact: DocumentArtifact[] },
): HealthScoreResult {
  // Required fields: 35 pts (7 each)
  const requiredFields: CategoryBreakdown = { filled: [], missing: [], score: 0, max: 35 };
  const requiredChecks: { name: string; present: boolean }[] = [
    { name: "title", present: !!document.title },
    { name: "originalDocumentUrl", present: !!document.originalDocumentUrl },
    { name: "dateSigned", present: !!document.dateSigned },
    { name: "signer", present: !!document.signer },
    { name: "type", present: !!document.type },
  ];
  for (const check of requiredChecks) {
    if (check.present) {
      requiredFields.filled.push(check.name);
      requiredFields.score += 7;
    } else {
      requiredFields.missing.push(check.name);
    }
  }

  // Optional fields: 10 pts (5 each)
  const optionalFields: CategoryBreakdown = { filled: [], missing: [], score: 0, max: 10 };
  const optionalChecks: { name: string; present: boolean }[] = [
    { name: "shortSummary", present: !!document.shortSummary },
    { name: "riskScore", present: document.riskScore != null },
  ];
  for (const check of optionalChecks) {
    if (check.present) {
      optionalFields.filled.push(check.name);
      optionalFields.score += 5;
    } else {
      optionalFields.missing.push(check.name);
    }
  }

  // Artifact coverage: 5 pts per standard artifact (excluding deprecated)
  const artifacts: CategoryBreakdown = { filled: [], missing: [], score: 0, max: 0 };
  const presentTitles = new Set(document.documentArtifact.map((a) => a.title));
  for (const title of artifactOrder) {
    if (deprecatedArtifacts.has(title)) continue; // Skip deprecated artifacts
    artifacts.max += 5;
    if (presentTitles.has(title)) {
      artifacts.filled.push(title);
      artifacts.score += 5;
    } else {
      artifacts.missing.push(title);
    }
  }

  // Published: 10 pts
  const published: CategoryBreakdown = {
    filled: document.published ? ["published"] : [],
    missing: document.published ? [] : ["published"],
    score: document.published ? 10 : 0,
    max: 10,
  };

  const score = requiredFields.score + optionalFields.score + artifacts.score + published.score;

  return {
    score,
    maxScore: 100,
    breakdown: { requiredFields, optionalFields, artifacts, published },
  };
}
