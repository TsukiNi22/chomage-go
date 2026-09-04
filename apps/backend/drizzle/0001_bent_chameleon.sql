CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"street" varchar(255),
	"postal_code" varchar(10),
	"city" varchar(100),
	"country_code" varchar(2) DEFAULT 'FR' NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"lambert_x" double precision,
	"lambert_y" double precision,
	"geocoding_source" varchar(50),
	"geocoding_score" double precision,
	"geocoded_at" timestamp,
	"needs_location_check" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "address_id" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "address_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address_id" integer;--> statement-breakpoint
CREATE INDEX "idx_addresses_city" ON "addresses" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_addresses_postal_code" ON "addresses" USING btree ("postal_code");--> statement-breakpoint
CREATE INDEX "idx_addresses_coords" ON "addresses" USING btree ("latitude","longitude");--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;