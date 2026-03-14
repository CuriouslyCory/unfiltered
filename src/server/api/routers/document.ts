import { z } from "zod";
import { DocumentType, type Prisma } from "~/generated/prisma/client";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { artifactOrder, RISK_RANGES } from "~/lib/document-utils";
import { getDocumentFts } from "~/generated/prisma/sql";

const adminSortColumns = ["id", "title", "createdAt", "updatedAt", "riskScore"] as const;

export const documentRouter = createTRPCRouter({
  getAdjacentDocuments: publicProcedure
    .input(z.object({ currentId: z.number() }))
    .query(async ({ ctx, input }) => {
      const currentDoc = await ctx.db.document.findUnique({
        where: { id: input.currentId },
        select: { dateSigned: true },
      });

      if (!currentDoc) {
        throw new Error("Document not found");
      }

      const [previousDoc, nextDoc] = await Promise.all([
        // Get the previous document (newer by date)
        ctx.db.document.findFirst({
          where: {
            dateSigned: {
              gt: currentDoc.dateSigned,
            },
            published: true,
          },
          orderBy: [
            {
              dateSigned: "asc",
            },
            { id: "asc" },
          ],
          select: {
            id: true,
            slug: true,
            title: true,
            riskScore: true,
            type: true,
          },
        }),
        // Get the next document (older by date)
        ctx.db.document.findFirst({
          where: {
            dateSigned: {
              lt: currentDoc.dateSigned,
            },
            published: true,
          },
          orderBy: [
            {
              dateSigned: "desc",
            },
            { id: "desc" },
          ],
          select: {
            id: true,
            slug: true,
            title: true,
            riskScore: true,
            type: true,
          },
        }),
      ]);

      return {
        previous: previousDoc,
        next: nextDoc,
      };
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const documents = await ctx.db.$queryRawTyped(
        getDocumentFts(input.query),
      );
      return documents;
    }),

  getRelated: publicProcedure
    .input(
      z.object({
        documentId: z.number(),
        type: z.nativeEnum(DocumentType),
        riskScore: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Try to find documents of the same type first
      const sameType = await ctx.db.document.findMany({
        where: {
          id: { not: input.documentId },
          type: input.type,
          published: true,
        },
        orderBy: { dateSigned: "desc" },
        take: 4,
      });

      if (sameType.length > 0) {
        return { documents: sameType, reason: "type" as const };
      }

      // Fall back to similar risk score (+/-1)
      const similarRisk = await ctx.db.document.findMany({
        where: {
          id: { not: input.documentId },
          published: true,
          riskScore: {
            gte: input.riskScore - 1,
            lte: input.riskScore + 1,
          },
        },
        orderBy: { dateSigned: "desc" },
        take: 4,
      });

      if (similarRisk.length > 0) {
        return { documents: similarRisk, reason: "risk" as const };
      }

      // Final fallback: highest-risk published documents
      const highestRisk = await ctx.db.document.findMany({
        where: {
          id: { not: input.documentId },
          published: true,
          riskScore: { not: null },
        },
        orderBy: { riskScore: "desc" },
        take: 4,
      });

      return { documents: highestRisk, reason: "risk" as const };
    }),

  getAll: publicProcedure
    .input(z.object({ onlyPublished: z.boolean().default(true) }))
    .query(async ({ ctx, input }) => {
      const documents = await ctx.db.document.findMany({
        where: input.onlyPublished
          ? {
              published: true,
            }
          : {},
        orderBy: [{ dateSigned: "desc" }, { id: "desc" }],
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
        type: z
          .enum([
            "EXECUTIVE_ORDER",
            "FACT_SHEET",
            "REMARKS",
            "LEGISLATION",
            "OTHER",
          ])
          .optional(),
        published: z.boolean().optional(),
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

  getAdminAdjacentDocuments: adminProcedure
    .input(
      z.object({
        currentId: z.number(),
        sort: z.enum(adminSortColumns).default("id"),
        order: z.enum(["asc", "desc"]).default("desc"),
        search: z.string().optional(),
        type: z.nativeEnum(DocumentType).optional(),
        risk: z
          .enum(["low", "moderate", "elevated", "high", "severe"])
          .optional(),
        published: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Build filter conditions (no published filter - admin sees all)
      const filters: Prisma.DocumentWhereInput[] = [];
      if (input.search) {
        filters.push({
          title: { contains: input.search, mode: "insensitive" },
        });
      }
      if (input.type) {
        filters.push({ type: input.type });
      }
      if (input.risk) {
        const range = RISK_RANGES[input.risk];
        if (range) {
          if (input.risk === "low") {
            filters.push({
              OR: [
                { riskScore: { gte: range[0], lte: range[1] } },
                { riskScore: null },
              ],
            });
          } else {
            filters.push({ riskScore: { gte: range[0], lte: range[1] } });
          }
        }
      }
      if (input.published !== undefined) {
        filters.push({ published: input.published });
      }

      const where: Prisma.DocumentWhereInput =
        filters.length > 0 ? { AND: filters } : {};

      // Fetch all matching documents with sortable fields
      const allDocs = await ctx.db.document.findMany({
        where,
        select: { id: true, title: true, createdAt: true, updatedAt: true, riskScore: true },
      });

      // Sort in JavaScript to match TanStack Table's client-side sorting
      // (TanStack uses case-insensitive string comparison, which differs from PostgreSQL collation)
      const sortCol = input.sort;
      const desc = input.order === "desc";
      allDocs.sort((a, b) => {
        const aVal = a[sortCol];
        const bVal = b[sortCol];

        let cmp: number;
        if (aVal == null && bVal == null) {
          cmp = 0;
        } else if (aVal == null) {
          cmp = -1; // nulls sort before non-null (treated as lowest)
        } else if (bVal == null) {
          cmp = 1;
        } else if (typeof aVal === "string" && typeof bVal === "string") {
          cmp = aVal.localeCompare(bVal, undefined, { sensitivity: "base" });
        } else if (aVal instanceof Date && bVal instanceof Date) {
          cmp = aVal.getTime() - bVal.getTime();
        } else {
          cmp = (aVal as number) - (bVal as number);
        }

        // Tiebreaker by id for deterministic ordering
        if (cmp === 0) {
          cmp = a.id - b.id;
        }

        return desc ? -cmp : cmp;
      });

      const currentIndex = allDocs.findIndex(
        (d) => d.id === input.currentId,
      );

      const pick = (d: { id: number; title: string }) => ({
        id: d.id,
        title: d.title,
      });

      return {
        previous:
          currentIndex > 0 ? pick(allDocs[currentIndex - 1]!) : null,
        next:
          currentIndex >= 0 && currentIndex < allDocs.length - 1
            ? pick(allDocs[currentIndex + 1]!)
            : null,
      };
    }),
});
