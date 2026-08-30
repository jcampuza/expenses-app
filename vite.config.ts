import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { fileRoutes } from "filesystem-routing/vite";
import { analyzer } from "vite-bundle-analyzer";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: Number(process.env.PORT) || 3000,
  },
  plugins: [
    tailwindcss(),
    solid({
      start: true,
      extensions: [".jsx", ".tsx"],
    }),
    fileRoutes(),
    process.env.ANALYZE === "true" ? analyzer() : null,
  ],
});
