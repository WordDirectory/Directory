CREATE TABLE "saved_words" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"word_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "saved_words" ADD CONSTRAINT "saved_words_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_words" ADD CONSTRAINT "saved_words_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "saved_words_user_word_idx" ON "saved_words" USING btree ("user_id","word_id");--> statement-breakpoint
CREATE INDEX "saved_words_user_id_idx" ON "saved_words" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_words_word_id_idx" ON "saved_words" USING btree ("word_id");