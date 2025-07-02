import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "delete-expired-invitations",
  {
    hourUTC: 6,
    minuteUTC: 0,
  },
  internal.invitations.deleteExpiredInvitations,
);

export default crons;
