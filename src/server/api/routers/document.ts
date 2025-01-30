import { z } from "zod";
import { type Document, type DocumentArtifact } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const documentRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const documents = await ctx.db.document.findMany({
      orderBy: {
        dateSigned: "desc",
      },
    });
    return documents;
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.db.document.findUnique({
        where: { slug: input.slug },
        include: {
          documentArtifact: true,
        },
      });
      if (!document) {
        throw new Error("Document not found");
      }
      return {
        ...document,
        documentArtifact: artifactOrder
          .map((title) => getArtifactByTitle(document, title))
          .filter((artifact) => artifact !== undefined),
      };
    }),
});

const artifactOrder = [
  "Key Points",
  "Areas of Concern",
  "Constitutional Considerations",
  "Take Action",
  "Risk Score Details",
  "Final Summary",
  "Original Document",
];

function getArtifactByTitle(
  document: Document & { documentArtifact: DocumentArtifact[] },
  title: string,
) {
  return document.documentArtifact.find((artifact) => artifact.title === title);
}
