import React from "react";
import { type Components } from "react-markdown";

export const markdownComponents: Components = {
  li: (props) => <li className="my-2" {...props} />,
  ul: (props) => (
    <ul className="mb-8 mt-2 list-inside list-disc pl-4" {...props} />
  ),
  h1: (props) => (
    <h1 className="my-4 font-serif text-2xl font-bold opacity-80" {...props} />
  ),
  h2: (props) => (
    <h2 className="my-4 font-serif text-xl font-bold opacity-80" {...props} />
  ),
  h3: (props) => (
    <h3 className="my-4 font-serif text-lg font-bold opacity-80" {...props} />
  ),
  h4: (props) => (
    <h4 className="my-4 font-serif text-base font-bold opacity-80" {...props} />
  ),
  p: (props) => <p className="my-4" {...props} />,
  a: (props) => <a className="text-blue-500 hover:underline" {...props} />,
  hr: (props) => (
    <hr className="my-4 border-gray-600 dark:border-gray-400" {...props} />
  ),
};
