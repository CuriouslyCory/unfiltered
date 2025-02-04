import { type Document, type DocumentArtifact } from "@prisma/client";

export const artifactOrder = [
  // "Updates",
  "ELI5",
  "Key Points",
  "Areas of Concern",
  "Constitutional Considerations",
  "Take Action",
  "Letter of Concern",
  // "Risk Score Details",
  "Final Summary",
  // "Original Document",
];

export function getArtifactByTitle(
  document: Document & { documentArtifact: DocumentArtifact[] },
  title: string,
) {
  return document.documentArtifact.find((artifact) => artifact.title === title);
}
