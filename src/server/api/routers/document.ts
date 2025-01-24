import { z } from "zod";

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
      return document;
    }),
});
