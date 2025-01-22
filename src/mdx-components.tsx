import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="my-4 text-2xl font-bold">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="my-4 text-xl font-bold">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="my-4 text-lg font-bold">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="my-4 text-base font-bold">{children}</h4>
    ),
    p: ({ children }) => <p className="my-4">{children}</p>,
    ul: ({ children }) => (
      <ul className="list-inside list-disc ps-4">{children}</ul>
    ),
    ...components,
  };
}
