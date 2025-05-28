import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_SITE_URL is not set");
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
