import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: "free",
            limits: {
              aiUsage: 10,
            },
          },
          {
            name: "plus",
            priceId: process.env.STRIPE_PLUS_PRICE_ID!,
            limits: {
              aiUsage: 1000,
            },
          },
          {
            name: "plus_annual",
            priceId: process.env.STRIPE_PLUS_ANNUAL_PRICE_ID!, // new annual price ID
            limits: {
              aiUsage: 1000, // same limits as monthly
            },
          },
        ],
        getCheckoutSessionParams: async () => ({
          params: {
            allow_promotion_codes: true,
          },
        }),
      },
    }),
  ],
  appName: "WordDirectory",
});

export type Auth = typeof auth;
