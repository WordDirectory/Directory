import { createAuthClient } from "better-auth/react";

const baseUrl =
  process.env.NODE_ENV === "development"
    ? `http://${process.env.NEXT_PUBLIC_SITE_URL}`
    : `https://${process.env.NEXT_PUBLIC_SITE_URL}`;

if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_SITE_URL is not set");
}

export const authClient = createAuthClient({
  baseURL: baseUrl,
});

export const { useSession } = authClient;
