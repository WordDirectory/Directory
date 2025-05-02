import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { sendEmail } from "./email";

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
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your WordDirectory account",
        text: `Welcome to WordDirectory! Click this link to verify your email: ${url}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
              <title>Verify your WordDirectory account</title>
              <style>
                /* Base */
                body {
                  background-color: #f8f8f8;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                  -webkit-font-smoothing: antialiased;
                  font-size: 16px;
                  line-height: 1.4;
                  margin: 0;
                  padding: 0;
                  -ms-text-size-adjust: 100%;
                  -webkit-text-size-adjust: 100%;
                }
                .container {
                  background-color: #ffffff;
                  border: 1px solid #e5e5e5;
                  border-radius: 12px;
                  max-width: 580px;
                  margin: 40px auto;
                  padding: 40px;
                }
                .header {
                  margin-bottom: 32px;
                  text-align: center;
                }
                .logo {
                  height: 40px;
                  width: 40px;
                }
                .brand {
                  font-size: 24px;
                  font-weight: 700;
                  margin-top: 16px;
                }
                .content {
                  margin-bottom: 32px;
                }
                .button {
                  background-color: #000000;
                  border-radius: 8px;
                  color: #ffffff !important;
                  display: inline-block;
                  font-size: 16px;
                  font-weight: 600;
                  line-height: 1;
                  padding: 16px 24px;
                  text-decoration: none;
                  text-align: center;
                  transition: background-color 0.15s ease-in-out;
                }
                .button:hover {
                  background-color: #1a1a1a;
                  color: #ffffff !important;
                }
                .footer {
                  color: #6b7280;
                  font-size: 14px;
                  margin-top: 32px;
                  text-align: center;
                }
                .link {
                  color: #000000;
                  text-decoration: underline;
                }
                @media only screen and (max-width: 620px) {
                  .container {
                    margin: 20px;
                    padding: 24px;
                    width: auto !important;
                  }
                  .content {
                    margin-bottom: 24px;
                  }
                  .button {
                    display: block;
                    text-align: center;
                    width: 100%;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <img src="https://worddirectory.app/logo.png" alt="WordDirectory Logo" class="logo">
                  <div class="brand">WordDirectory</div>
                </div>
                <div class="content">
                  <h1 style="margin-bottom: 24px; font-size: 24px; font-weight: 700;">Verify your email address</h1>
                  <p style="margin-bottom: 24px;">Thanks for signing up for WordDirectory! We need to verify your email address to keep your account secure.</p>
                  <div style="text-align: center;">
                    <a href="${url}" class="button" style="background-color: #000000; color: #ffffff; text-decoration: none;">Verify Email Address</a>
                  </div>
                </div>
                <div class="footer">
                  <p>If you didn't create an account with WordDirectory, you can safely ignore this email.</p>
                  <p style="margin-top: 16px;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <a href="${url}" class="link">${url}</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    },
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
