import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  serial,
  index,
  uniqueIndex,
  integer,
  real,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
}).enableRLS();

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
}).enableRLS();

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
}).enableRLS();

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
}).enableRLS();

export const words = pgTable(
  "words",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    word: text("word").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    idx: serial("idx").notNull(),
  },
  (table) => [
    uniqueIndex("words_word_idx").on(table.word),
    index("idx_words_idx").on(table.idx),
  ]
).enableRLS();

export const wordPronunciations = pgTable(
  "word_pronunciations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    word: text("word").notNull(),
    videoId: text("video_id").notNull(),
    timestampStart: real("timestamp_start").notNull(),
    timestampEnd: real("timestamp_end").notNull(),
    confidenceScore: real("confidence_score"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("word_pronunciations_word_idx").on(table.word),
    index("word_pronunciations_video_id_idx").on(table.videoId),
    index("word_pronunciations_confidence_idx").on(table.confidenceScore),
  ]
).enableRLS();

export const definitions = pgTable(
  "definitions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    wordId: uuid("word_id")
      .notNull()
      .references(() => words.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    order: serial("order").notNull(),
  },
  (table) => [
    index("definitions_word_id_idx").on(table.wordId),
    index("definitions_order_idx").on(table.order),
  ]
).enableRLS();

export const examples = pgTable(
  "examples",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    definitionId: uuid("definition_id")
      .notNull()
      .references(() => definitions.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    order: serial("order").notNull(),
  },
  (table) => [
    index("examples_definition_id_idx").on(table.definitionId),
    index("examples_order_idx").on(table.order),
  ]
).enableRLS();

export const savedWords = pgTable(
  "saved_words",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    wordId: uuid("word_id")
      .notNull()
      .references(() => words.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    // Index for looking up if a user has saved a specific word
    uniqueIndex("saved_words_user_word_idx").on(table.userId, table.wordId),
    // Index for getting all saved words for a user
    index("saved_words_user_id_idx").on(table.userId),
    // Index for getting all users who saved a word
    index("saved_words_word_id_idx").on(table.wordId),
  ]
).enableRLS();

export const savedWordsRelations = relations(savedWords, ({ one }) => ({
  user: one(users, {
    fields: [savedWords.userId],
    references: [users.id],
  }),
  word: one(words, {
    fields: [savedWords.wordId],
    references: [words.id],
  }),
}));

// Update word relations to include saved words
export const wordsRelations = relations(words, ({ many }) => ({
  definitions: many(definitions),
  votes: many(wordVotes),
  savedBy: many(savedWords),
  feedback: many(wordFeedback),
  reports: many(wordReports),
}));

export const definitionsRelations = relations(definitions, ({ one, many }) => ({
  word: one(words, {
    fields: [definitions.wordId],
    references: [words.id],
  }),
  examples: many(examples),
}));

export const examplesRelations = relations(examples, ({ one }) => ({
  definition: one(definitions, {
    fields: [examples.definitionId],
    references: [definitions.id],
  }),
}));

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  plan: text("plan", { enum: ["free", "plus"] }).notNull(),
  referenceId: text("reference_id").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end"),
  seats: integer("seats"),
}).enableRLS();

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.referenceId],
    references: [users.id],
  }),
}));

export const aiUsage = pgTable(
  "ai_usage",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    count: integer("count").notNull().default(0),
    resetAt: timestamp("reset_at").notNull(), // When the counter resets
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("ai_usage_user_id_idx").on(table.userId),
    index("ai_usage_reset_at_idx").on(table.resetAt),
  ]
).enableRLS();

// Add the relation to users
export const aiUsageRelations = relations(aiUsage, ({ one }) => ({
  user: one(users, {
    fields: [aiUsage.userId],
    references: [users.id],
  }),
}));

export const wordVotes = pgTable(
  "word_votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    wordId: uuid("word_id")
      .notNull()
      .references(() => words.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    // Index for looking up a user's vote on a specific word
    uniqueIndex("word_votes_user_word_idx").on(table.userId, table.wordId),
    // Index for getting all votes for a word
    index("word_votes_word_id_idx").on(table.wordId),
    // Index for getting all votes by a user
    index("word_votes_user_id_idx").on(table.userId),
  ]
).enableRLS();

export const wordVotesRelations = relations(wordVotes, ({ one }) => ({
  user: one(users, {
    fields: [wordVotes.userId],
    references: [users.id],
  }),
  word: one(words, {
    fields: [wordVotes.wordId],
    references: [words.id],
  }),
}));

// Update user relations to include saved words
export const userRelations = relations(users, ({ many }) => ({
  votes: many(wordVotes),
  savedWords: many(savedWords),
  wordLookups: many(wordLookups),
  wordHistory: many(wordHistory),
  feedback: many(wordFeedback),
  reports: many(wordReports),
}));

export const wordLookups = pgTable(
  "word_lookups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    ipAddress: text("ip_address").notNull(),
    count: integer("count").notNull().default(0),
    resetAt: timestamp("reset_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("word_lookups_user_id_idx").on(table.userId),
    index("word_lookups_ip_address_idx").on(table.ipAddress),
    index("word_lookups_reset_at_idx").on(table.resetAt),
  ]
).enableRLS();

export const wordLookupsRelations = relations(wordLookups, ({ one }) => ({
  user: one(users, {
    fields: [wordLookups.userId],
    references: [users.id],
  }),
}));

export const wordHistory = pgTable(
  "word_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    ipAddress: text("ip_address").notNull(),
    wordId: uuid("word_id")
      .notNull()
      .references(() => words.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    // Index for looking up if a user/IP has viewed a word
    uniqueIndex("word_history_user_ip_word_idx").on(
      table.userId,
      table.ipAddress,
      table.wordId
    ),
    // Index for getting all words viewed by a user/IP
    index("word_history_user_id_idx").on(table.userId),
    index("word_history_ip_address_idx").on(table.ipAddress),
  ]
).enableRLS();

export const wordHistoryRelations = relations(wordHistory, ({ one }) => ({
  user: one(users, {
    fields: [wordHistory.userId],
    references: [users.id],
  }),
  word: one(words, {
    fields: [wordHistory.wordId],
    references: [words.id],
  }),
}));

export const wordFeedback = pgTable(
  "word_feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    wordId: uuid("word_id")
      .notNull()
      .references(() => words.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    status: text("status", { enum: ["pending", "reviewed", "resolved"] })
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    // Index for getting all feedback for a word
    index("word_feedback_word_id_idx").on(table.wordId),
    // Index for getting all feedback by a user
    index("word_feedback_user_id_idx").on(table.userId),
    // Index for getting feedback by status
    index("word_feedback_status_idx").on(table.status),
  ]
).enableRLS();

export const wordFeedbackRelations = relations(wordFeedback, ({ one }) => ({
  user: one(users, {
    fields: [wordFeedback.userId],
    references: [users.id],
  }),
  word: one(words, {
    fields: [wordFeedback.wordId],
    references: [words.id],
  }),
}));

export const wordReports = pgTable(
  "word_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    wordId: uuid("word_id")
      .notNull()
      .references(() => words.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    // Index for looking up if a user has reported a specific word
    uniqueIndex("word_reports_user_word_idx").on(table.userId, table.wordId),
    // Index for getting all reports for a word
    index("word_reports_word_id_idx").on(table.wordId),
    // Index for getting all reports by a user
    index("word_reports_user_id_idx").on(table.userId),
  ]
).enableRLS();

export const wordReportsRelations = relations(wordReports, ({ one }) => ({
  user: one(users, {
    fields: [wordReports.userId],
    references: [users.id],
  }),
  word: one(words, {
    fields: [wordReports.wordId],
    references: [words.id],
  }),
}));
