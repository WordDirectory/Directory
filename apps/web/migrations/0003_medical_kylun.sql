CREATE TABLE "ai_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_usage_user_id_idx" ON "ai_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_usage_reset_at_idx" ON "ai_usage" USING btree ("reset_at");