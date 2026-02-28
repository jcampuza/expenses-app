const clerkFrontendApiUrl = process.env.VITE_CLERK_FRONTEND_API_URL;

if (!clerkFrontendApiUrl) {
  throw new Error(
    "Missing Clerk frontend API URL. Set CLERK_FRONTEND_API_URL (preferred), NEXT_PUBLIC_CLERK_FRONTEND_API_URL, or VITE_CLERK_FRONTEND_API_URL.",
  );
}

const authConfig = {
  providers: [
    {
      domain: clerkFrontendApiUrl,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
