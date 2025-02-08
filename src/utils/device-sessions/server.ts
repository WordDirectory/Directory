import { createClient } from "@/utils/supabase/server";
import { TDeviceInfo, TDeviceSessionOptions } from "@/types/auth";
import { UAParser } from "ua-parser-js";
import { Provider } from "@supabase/auth-js";

// Only the providers we actually support
export type TDeviceSessionProvider = "browser" | "google" | "email";

async function createDevice(device: TDeviceInfo) {
  if (typeof window !== "undefined") {
    throw new Error("Cannot create or find device on the client");
  }

  const supabase = await createClient();

  // Get user to check if they exist
  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("No user found");
  }

  // Create new device
  const { data: newDevice, error: createError } = await supabase
    .from("devices")
    .insert(device)
    .select("id")
    .single();

  if (createError) {
    throw createError;
  }

  return newDevice.id;
}

export type TCreateDeviceSessionParams = {
  user_id: string;
  device: TDeviceInfo;
  confidence_score: number;
  needs_verification: boolean;
  is_trusted: boolean;
};

/**
 * Creates a device session with proper trust and verification settings based on the auth flow
 * @param request The incoming request object
 * @param user_id The ID of the user to create the session for
 * @param options Configuration options for the session
 * @returns The created session ID
 */
export async function setupDeviceSession(
  request: Request,
  user_id: string,
  options: TDeviceSessionOptions
): Promise<string> {
  // Parse user agent for device info
  const parser = new UAParser(request.headers.get("user-agent") || "");
  const currentDevice: TDeviceInfo = {
    user_id,
    device_name: parser.getDevice().model || "Unknown Device",
    browser: parser.getBrowser().name || "Unknown Browser",
    os: parser.getOS().name || "Unknown OS",
    ip_address: request.headers.get("x-forwarded-for") || "::1",
  };

  // Calculate confidence and verification needs based on trust level
  let confidence_score: number;
  let needs_verification: boolean;
  let is_trusted: boolean;

  switch (options.trustLevel) {
    case "high":
      // High trust for password reset, email verification, etc.
      confidence_score = 100;
      needs_verification = false;
      is_trusted = true;
      break;
    case "oauth":
      // OAuth providers are generally trusted
      confidence_score = 85;
      needs_verification = false;
      is_trusted = true;
      break;
    case "normal":
      // Regular email/password login
      confidence_score = 70;
      needs_verification = !options.skipVerification;
      is_trusted = false;
      break;
  }

  // Create the session
  const session_id = await createDeviceSession({
    user_id,
    device: currentDevice,
    confidence_score,
    needs_verification,
    is_trusted,
  });

  return session_id;
}

// Only use this function on the server
export async function createDeviceSession(params: TCreateDeviceSessionParams) {
  if (typeof window !== "undefined") {
    throw new Error("Cannot create device session on the client");
  }

  const supabase = await createClient();
  const device_id = await createDevice(params.device);
  const session_id = crypto.randomUUID();

  const { error: sessionError } = await supabase
    .from("device_sessions")
    .insert({
      user_id: params.user_id,
      session_id,
      device_id,
      confidence_score: params.confidence_score,
      needs_verification: params.needs_verification,
      is_trusted: params.is_trusted,
    });

  if (sessionError) {
    throw sessionError;
  }

  return session_id;
}
