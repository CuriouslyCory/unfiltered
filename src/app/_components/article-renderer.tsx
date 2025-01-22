"use client";

import dynamic from "next/dynamic";

export default function ArticleRenderer({ slug }: { slug: string }) {
  const Article = dynamic(
    () => import(`~/app/eo-summary/_articles/${slug}.mdx`),
    {
      ssr: false,
    },
  );
  return <Article />;
}
