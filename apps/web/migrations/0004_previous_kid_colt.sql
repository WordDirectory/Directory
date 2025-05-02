CREATE TABLE "word_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"word_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "word_votes" ADD CONSTRAINT "word_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_votes" ADD CONSTRAINT "word_votes_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "word_votes_user_word_idx" ON "word_votes" USING btree ("user_id","word_id");--> statement-breakpoint
CREATE INDEX "word_votes_word_id_idx" ON "word_votes" USING btree ("word_id");--> statement-breakpoint
CREATE INDEX "word_votes_user_id_idx" ON "word_votes" USING btree ("user_id");