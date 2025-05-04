CREATE TABLE "word_lookups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"ip_address" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "word_lookups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ai_usage" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "definitions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "examples" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "saved_words" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "word_votes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "words" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "word_lookups" ADD CONSTRAINT "word_lookups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "word_lookups_user_id_idx" ON "word_lookups" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "word_lookups_ip_address_idx" ON "word_lookups" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "word_lookups_reset_at_idx" ON "word_lookups" USING btree ("reset_at");