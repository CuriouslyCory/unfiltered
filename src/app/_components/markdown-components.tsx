import React from "react";
import { type Components } from "react-markdown";

export const markdownComponents: Components = {
  li: (props) => <li className="my-2" {...props} />,
  ul: (props) => (
    <ul className="mb-6 mt-2 list-inside list-disc pl-4" {...props} />
  ),
  h1: (props) => <h1 className="my-4 text-2xl font-bold" {...props} />,
  h2: (props) => <h2 className="my-4 text-xl font-bold" {...props} />,
  h3: (props) => <h3 className="my-4 text-lg font-bold" {...props} />,
  h4: (props) => <h4 className="my-4 text-base font-bold" {...props} />,
  p: (props) => <p className="my-4" {...props} />,
  a: (props) => <a className="text-blue-500 hover:underline" {...props} />,
};
