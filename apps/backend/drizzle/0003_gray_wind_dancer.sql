ALTER TABLE "applications" ADD COLUMN "status" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "max_applicants" integer;