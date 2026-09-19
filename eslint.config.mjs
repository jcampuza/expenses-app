import js from "@eslint/js";
import tseslint from "typescript-eslint";
import convexPlugin from "@convex-dev/eslint-plugin";
import solid from "eslint-plugin-solid/configs/v2";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["convex/_generated/**", "dist", ".output", "file-routes.d.ts"],
  },
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    ...solid,
  },
  {
    files: ["**/*.{ts,tsx,js,jsx,mts,cts}"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        process: "readonly",
        URL: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLFormElement: "readonly",
        HTMLSelectElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLDialogElement: "readonly",
        KeyboardEvent: "readonly",
        Event: "readonly",
        CustomEvent: "readonly",
        FormData: "readonly",
        ReadableStream: "readonly",
        AbortController: "readonly",
        SubmitEvent: "readonly",
        InputEvent: "readonly",
        MouseEvent: "readonly",
        PointerEvent: "readonly",
        HTMLDivElement: "readonly",
        HTMLTableElement: "readonly",
        HTMLTableSectionElement: "readonly",
        HTMLTableRowElement: "readonly",
        HTMLTableCellElement: "readonly",
        HTMLLabelElement: "readonly",
        SVGSVGElement: "readonly",
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...convexPlugin.configs.recommended,
  {
    files: ["convex/**/*.ts"],
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      "@convex-dev/no-collect-in-query": "error",
      "@convex-dev/require-access-control": [
        "error",
        {
          pattern: "^(require|assert|check|ensure|can|has|getMeDocument)",
        },
      ],
    },
  },
]);
