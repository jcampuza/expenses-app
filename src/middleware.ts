import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes - all routes under (protected) folder
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/settings(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { isAuthenticated } = await auth();

  const isProtected = isProtectedRoute(req);

  // If a user is authenticated:
  // - If the route is protected, allow access
  // - If the route is not protected, redirect to dashboard

  if (isAuthenticated) {
    return isProtected
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If a user is not authenticated:
  // - If the route is protected, redirect to home
  // - If the route is not protected, allow access
  return isProtected
    ? NextResponse.redirect(new URL("/", req.url))
    : NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
