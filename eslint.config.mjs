import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["convex/_generated/**"],
  },
];

export default eslintConfig;
