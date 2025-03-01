import { NextRequest } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";
import { deleteExpiredInvitations } from "~/server/db/queries";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  await deleteExpiredInvitations(db);
  return new Response("OK");
}
