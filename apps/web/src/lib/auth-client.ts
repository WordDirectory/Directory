import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";

// For SSR/build time, we still need the env var
const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;

if (!baseUrl) {
  throw new Error("SITE_URL is not set");
}

export const authClient = createAuthClient({
  baseURL: baseUrl,
  plugins: [
    stripeClient({
      subscription: true,
    }),
  ],
});

export const { useSession } = authClient;
