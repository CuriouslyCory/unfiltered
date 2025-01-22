import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="mb-4 text-2xl font-bold">{children}</h1>
    ),
    p: ({ children }) => <p className="mb-4">{children}</p>,
    ul: ({ children }) => <ul className="list-inside list-disc">{children}</ul>,
    ...components,
  };
}
