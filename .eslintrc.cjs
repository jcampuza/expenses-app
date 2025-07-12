/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: ["@typescript-eslint", "drizzle"],
  extends: ["plugin:@typescript-eslint/strict"],
  rules: {
    "@typescript-eslint/no-unused-vars": "error",
  },
};
module.exports = config;
