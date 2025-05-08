import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "https://worddirectory.app",
});

export const { useSession } = authClient;
