"use client";

import dynamic from "next/dynamic";

export default function ArticleRenderer({ slug }: { slug: string }) {
  const Article = dynamic(() => import(`~/articles/${slug}.mdx`), {
    ssr: false,
  });
  return <Article />;
}
