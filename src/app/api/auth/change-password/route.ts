/**
 * This route is for:
 * 1. Authenticated users that want to change their password
 * 2. OAuth users that want to add a password to their account
 *
 * For users that signed up with email/password:
 * - Requires current password verification
 * - Updates to new password if verification succeeds
 *
 * For users that signed up with OAuth:
 * - Skips current password verification
 * - Adds password to their account
 * - Keeps OAuth provider connected
 */

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import {
  TApiErrorResponse,
  TEmptySuccessResponse,
  TPasswordChangeResponse,
} from "@/types/api";
import { apiRateLimit } from "@/utils/rate-limit";
import {
  checkTwoFactorRequirements,
  verifyTwoFactorCode,
} from "@/utils/two-factor";
import {
  passwordChangeSchema,
  twoFactorVerificationSchema,
} from "@/utils/validation/auth-validation";

export async function POST(request: NextRequest) {
  if (apiRateLimit) {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await apiRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
        },
        { status: 429 }
      );
    }
  }

  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ) satisfies NextResponse<TApiErrorResponse>;
    }

    const body = await request.json();

    // Check if this is a 2FA verification request
    const twoFactorValidation = twoFactorVerificationSchema.safeParse(body);
    if (twoFactorValidation.success) {
      const { factorId, code } = twoFactorValidation.data;
      const { newPassword } = body;

      if (!newPassword) {
        return NextResponse.json(
          { error: "New password is required" },
          { status: 400 }
        ) satisfies NextResponse<TApiErrorResponse>;
      }

      try {
        // Verify 2FA code
        await verifyTwoFactorCode(supabase, factorId, code);

        // Update password after successful 2FA verification
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) throw updateError;

        return NextResponse.json(
          {}
        ) satisfies NextResponse<TEmptySuccessResponse>;
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error ? error.message : "Failed to verify code",
          },
          { status: 400 }
        ) satisfies NextResponse<TApiErrorResponse>;
      }
    }

    // If not a 2FA request, validate password change data
    const validation = passwordChangeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      ) satisfies NextResponse<TApiErrorResponse>;
    }

    const { currentPassword, newPassword } = validation.data;

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      ) satisfies NextResponse<TApiErrorResponse>;
    }

    // Check if 2FA is required
    try {
      const twoFactorResult = await checkTwoFactorRequirements(supabase);

      if (twoFactorResult.requiresTwoFactor) {
        return NextResponse.json({
          ...twoFactorResult,
          newPassword,
        }) satisfies NextResponse<TPasswordChangeResponse>;
      }
    } catch (error) {
      console.error("Error checking 2FA requirements:", error);
      return NextResponse.json(
        { error: "Failed to check 2FA status" },
        { status: 500 }
      ) satisfies NextResponse<TApiErrorResponse>;
    }

    // If no 2FA required, update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) throw updateError;

    return NextResponse.json({}) satisfies NextResponse<TEmptySuccessResponse>;
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    ) satisfies NextResponse<TApiErrorResponse>;
  }
}
