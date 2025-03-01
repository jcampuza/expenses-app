-- 1. Create the enum "payment_type" only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'payment_type'
    ) THEN
        CREATE TYPE "public"."payment_type" AS ENUM (
            'paid_by_owner_split_equally',
            'paid_by_owner_participant_owes',
            'paid_by_participant_split_equally',
            'paid_by_participant_owner_owes'
        );
    END IF;
END
$$;

-- 2. Create tables if they do not exist and enable row-level security

CREATE TABLE IF NOT EXISTS "expenses" (
    "id" serial PRIMARY KEY,
    "name" text NOT NULL,
    "date" timestamp DEFAULT now() NOT NULL,
    "category" text,
    "total_cost" real NOT NULL,
    "currency" text DEFAULT 'USD' NOT NULL,
    "owner_id" text NOT NULL
);

ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "expense_participants" (
    "id" serial PRIMARY KEY,
    "expense_id" integer NOT NULL,
    "participant_id" text NOT NULL,
    "payment_type" "payment_type" NOT NULL
);

ALTER TABLE "expense_participants" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "invitations" (
    "token" text PRIMARY KEY,
    "inviter_user_id" text NOT NULL,
    "expiration_time" text NOT NULL,
    "is_used" boolean DEFAULT false NOT NULL,
    "created_at" text NOT NULL
);

ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS "user_connections" (
    "id" serial PRIMARY KEY,
    "inviter_user_id" text NOT NULL,
    "invitee_user_id" text NOT NULL,
    "accepted_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "user_connections" ENABLE ROW LEVEL SECURITY;

-- 3. Add the foreign key constraint only if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'expense_participants_expense_id_expenses_id_fk'
    ) THEN
        ALTER TABLE "expense_participants"
        ADD CONSTRAINT "expense_participants_expense_id_expenses_id_fk"
          FOREIGN KEY ("expense_id")
          REFERENCES "public"."expenses"("id")
          ON DELETE NO ACTION
          ON UPDATE NO ACTION;
    END IF;
END
$$;
