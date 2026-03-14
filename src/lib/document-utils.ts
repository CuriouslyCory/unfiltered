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

export function getArtifactByTitle(
  document: Document & { documentArtifact: DocumentArtifact[] },
  title: string,
) {
  return document.documentArtifact.find((artifact) => artifact.title === title);
}
