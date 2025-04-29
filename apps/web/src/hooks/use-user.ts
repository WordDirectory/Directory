import useSWR from "swr";
import { User } from "@/types/auth";
import { createClient } from "@/lib/supabase/client";
import { createUserRecord } from "@/lib/auth";

type UpdateUserData = Partial<Pick<User, "name" | "username">>;

async function getUser() {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Fetch additional user data from our users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error("Error fetching user data:", userError);
    return null;
  }

  // If user exists in auth but not in users table, create their record
  if (!userData) {
    return await createUserRecord(user.id, user.email ?? null);
  }

  return {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    username: userData.username,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
  } as User;
}

export function useUser() {
  const { data: user, error, mutate } = useSWR("user", getUser);

  const updateProfile = async (data: UpdateUserData) => {
    const supabase = createClient();

    if (!user) {
      throw new Error("No user logged in");
    }

    const { error } = await supabase
      .from("users")
      .update(data)
      .eq("id", user.id);

    if (error) {
      if (error.code === "23505") {
        throw new Error("Username already taken");
      }
      throw error;
    }

    // Revalidate the user data
    await mutate();
  };

  return {
    user,
    error,
    loading: !error && !user,
    mutate,
    updateProfile,
  };
}
