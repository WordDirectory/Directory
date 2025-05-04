CREATE TABLE "word_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"ip_address" text NOT NULL,
	"word_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "word_history" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "word_history" ADD CONSTRAINT "word_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_history" ADD CONSTRAINT "word_history_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "word_history_user_ip_word_idx" ON "word_history" USING btree ("user_id","ip_address","word_id");--> statement-breakpoint
CREATE INDEX "word_history_user_id_idx" ON "word_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "word_history_ip_address_idx" ON "word_history" USING btree ("ip_address");