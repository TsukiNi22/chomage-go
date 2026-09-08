ALTER TABLE "companies" ADD COLUMN "suspended_at" timestamp;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "banned_at" timestamp;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "moderation_reason" text;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "company_id" integer;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;