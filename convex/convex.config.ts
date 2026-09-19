import { defineApp } from "convex/server";
import { v } from "convex/values";

export default defineApp({
  env: {
    NEXT_PUBLIC_CLERK_FRONTEND_API_URL: v.string(),
    FX_RATES_API_KEY: v.optional(v.string()),
  },
});
