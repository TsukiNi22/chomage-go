ALTER TABLE "jobs" ADD COLUMN "sector" varchar(100);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "remote" integer DEFAULT 0 NOT NULL;