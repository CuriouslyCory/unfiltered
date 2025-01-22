import ArticleRenderer from "~/app/_components/article-renderer";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;

  return (
    <div className="">
      <ArticleRenderer slug={slug} />
    </div>
  );
}
