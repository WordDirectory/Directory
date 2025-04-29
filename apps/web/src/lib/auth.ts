import { createClient } from "./supabase/client";
import { User } from "@/types/auth";

export type AuthError = {
  message: string;
  status: number;
};

export function generateDefaultUsername(email: string | null): string | null {
  if (!email) return null;
  return email.split("@")[0];
}

export function generateDefaultName(email: string | null): string | null {
  if (!email) return null;
  return email
    .split("@")[0]
    .replace(/[^a-zA-Z]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export async function createUserRecord(
  userId: string,
  email: string | null,
  options?: {
    name?: string | null;
    username?: string | null;
  }
): Promise<User | null> {
  const supabase = createClient();

  const defaultUsername = generateDefaultUsername(email);
  const defaultName = generateDefaultName(email);

  const { data: userData, error: insertError } = await supabase
    .from("users")
    .insert({
      id: userId,
      email: email,
      name: options?.name ?? defaultName,
      username: options?.username ?? defaultUsername,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error creating user record:", insertError);
    return null;
  }

  return {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    username: userData.username,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
  };
}

export async function signUp(
  email: string,
  password: string
): Promise<{ data: User | null; error: AuthError | null }> {
  try {
    const supabase = createClient();

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return {
        data: null,
        error: {
          message: signUpError.message,
          status: 400,
        },
      };
    }

    if (!authData.user) {
      return {
        data: null,
        error: {
          message: "No user data returned",
          status: 400,
        },
      };
    }

    // Create the user record in our database
    const user = await createUserRecord(authData.user.id, email);

    if (!user) {
      return {
        data: null,
        error: {
          message: "Failed to create user record",
          status: 500,
        },
      };
    }

    return { data: user, error: null };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
        status: 500,
      },
    };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ data: User | null; error: AuthError | null }> {
  try {
    const supabase = createClient();

    const { data: authData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      return {
        data: null,
        error: {
          message: signInError.message,
          status: 400,
        },
      };
    }

    if (!authData.user) {
      return {
        data: null,
        error: {
          message: "No user data returned",
          status: 400,
        },
      };
    }

    // Fetch the user record from our database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (userError || !userData) {
      return {
        data: null,
        error: {
          message: "Failed to fetch user data",
          status: 500,
        },
      };
    }

    return {
      data: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        username: userData.username,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      },
      error: null,
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
        status: 500,
      },
    };
  }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        error: {
          message: error.message,
          status: 400,
        },
      };
    }

    return { error: null };
  } catch (error) {
    console.error("Sign out error:", error);
    return {
      error: {
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
        status: 500,
      },
    };
  }
}
