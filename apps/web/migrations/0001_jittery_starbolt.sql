CREATE TABLE "definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"word_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"order" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE "examples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"definition_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"order" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE "words" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"word" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"idx" serial NOT NULL,
	CONSTRAINT "words_word_unique" UNIQUE("word")
);
--> statement-breakpoint
ALTER TABLE "definitions" ADD CONSTRAINT "definitions_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examples" ADD CONSTRAINT "examples_definition_id_definitions_id_fk" FOREIGN KEY ("definition_id") REFERENCES "public"."definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "definitions_word_id_idx" ON "definitions" USING btree ("word_id");--> statement-breakpoint
CREATE INDEX "definitions_order_idx" ON "definitions" USING btree ("order");--> statement-breakpoint
CREATE INDEX "examples_definition_id_idx" ON "examples" USING btree ("definition_id");--> statement-breakpoint
CREATE INDEX "examples_order_idx" ON "examples" USING btree ("order");--> statement-breakpoint
CREATE UNIQUE INDEX "words_word_idx" ON "words" USING btree ("word");--> statement-breakpoint
CREATE INDEX "idx_words_idx" ON "words" USING btree ("idx");