// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  pageExtensions: ["js", "jsx", "ts", "tsx"],
};

// Merge MDX config with Next.js config
export default config;
