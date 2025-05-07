CREATE TABLE "word_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"word_id" uuid NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "word_feedback" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "word_feedback" ADD CONSTRAINT "word_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_feedback" ADD CONSTRAINT "word_feedback_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "word_feedback_word_id_idx" ON "word_feedback" USING btree ("word_id");--> statement-breakpoint
CREATE INDEX "word_feedback_user_id_idx" ON "word_feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "word_feedback_status_idx" ON "word_feedback" USING btree ("status");