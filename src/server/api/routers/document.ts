import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { artifactOrder } from "~/lib/document-utils";
import { getDocumentFts } from "@prisma/client/sql";

export const documentRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const documents = await ctx.db.$queryRawTyped(
        getDocumentFts(input.query),
      );
      return documents;
    }),

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
        documentArtifact: document.documentArtifact.sort(
          (a, b) =>
            artifactOrder.indexOf(a.title) - artifactOrder.indexOf(b.title),
        ),
      };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        riskScore: z.number().nullable().optional(),
        shortSummary: z.string().nullable().optional(),
        dateSigned: z.date().optional(),
        signer: z.string().optional(),
        originalDocumentUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const document = await ctx.db.document.update({
        where: { id },
        data: updateData,
        include: {
          documentArtifact: true,
        },
      });

      return document;
    }),

  updateArtifact: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const artifact = await ctx.db.documentArtifact.update({
        where: { id },
        data: updateData,
      });

      return artifact;
    }),

  createArtifact: adminProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        documentId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const artifact = await ctx.db.documentArtifact.create({
        data: input,
      });

      return artifact;
    }),

  deleteArtifact: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.documentArtifact.delete({
        where: { id: input.id },
      });

      return true;
    }),
});
