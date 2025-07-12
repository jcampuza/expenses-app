# Expense Web App

This is a web application for tracking expenses, built with a modern tech stack.

I primarily built this to track expenses between me and my partner as an alternative to Splitwise. I got annoyed that SplitWise has added more and more ads, adding any expense requires waiting for an ad now unless you have the pro plan. Thats stupid. So I built this just for us.

It should work for anybody and you can host it yourself. Our version is hosted at `https://expensemate.fyi`

Recommended to host on vercel since thats what this is setup for but is possible to just update the vite config/tanstack output to whatever tanstack supports.

Note this was migrated from Next.js to Tanstack and I haven't had time to completely reconfigure the folder structure, so some of it still looks similar to next.js routing config.

## Tech Stack

This project is built with the following technologies:

- **Framework**: [TanStack Start](https://tanstack.com/start) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Convex](https://convex.dev/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Routing**: [TanStack Router](https://tanstack.com/router/v1)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/v5)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Runtime**: [Bun](https://bun.sh/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have [Bun](https://bun.sh/) installed on your machine.

### Installation & Setup

1.  Clone the repo
2.  Install
    ```sh
    bun install
    ```
3.  Set up your environment variables. You'll need to create a `.env.local` file and add your Convex and Clerk credentials.
    ```
    CLERK_SECRET_KEY=
    VITE_CLERK_FRONTEND_API_URL
    VITE_CLERK_PUBLISHABLE_KEY=...
    VITE_CONVEX_URL=...
    CONVEX_DEPLOYMENT=... (normally autofilled by convex dev)
    ```

### Running the Development Server

You can run the development server, which will start both the Vite dev server and the Convex dev server.

```sh
bun run dev
```

## Deployment

This application is configured for deployment on [Vercel](https://vercel.com/), but you can deploy it to any hosting provider that supports Node.js applications.

## Other

A decent amount of this was developed with the assistance of AI tools like Cursor.
