"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user-store";
import { KeyRound, LaptopMinimalIcon, ShieldIcon } from "lucide-react";
import { SettingCard } from "@/components/setting-card";
import { FormField } from "@/components/form-field";
import {
  passwordChangeSchema,
  type PasswordChangeSchema,
} from "@/utils/validation/auth-validation";
import { z } from "zod";
import { toast } from "sonner";
import { SmartphoneIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { TwoFactorSetupDialog } from "@/components/2fa-setup-dialog";
import { AUTH_CONFIG } from "@/config/auth";
import { TTwoFactorMethod } from "@/types/auth";
import { TwoFactorVerifyForm } from "@/components/2fa-verify-form";
import { useDeviceSessions } from "@/hooks/use-device-sessions";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatRelativeTime } from "@/lib/utils";
import { isDeviceSessionActive } from "@/utils/device-sessions";

type FormErrors = Partial<Record<keyof PasswordChangeSchema, string>>;

export default function Security() {
  const { isLoading, user } = useUserStore();
  const hasPasswordAuth = user?.auth.providers.includes("email");
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [setupData, setSetupData] = useState<{
    qrCode?: string;
    secret?: string;
    factorId: string;
    method: TTwoFactorMethod;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    factorId: string;
    availableMethods: Array<{ type: TTwoFactorMethod; factorId: string }>;
    newPassword: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form data
      passwordChangeSchema.parse(formData);
      setErrors({});

      // Send request to API
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Too many attempts", {
            description: "Please wait a moment before trying again.",
            duration: 4000,
          });
          return;
        }

        // Handle other errors
        toast.error("Error", {
          description:
            data.error || "Failed to update password. Please try again.",
          duration: 3000,
        });
        return;
      }

      // Check if 2FA is required
      if (data.requiresTwoFactor) {
        setTwoFactorData({
          factorId: data.factorId,
          availableMethods: data.availableMethods,
          newPassword: data.newPassword,
        });
        setShowTwoFactorDialog(true);
        return;
      }

      // Success
      toast.success(hasPasswordAuth ? "Password updated" : "Password added", {
        description: hasPasswordAuth
          ? "Your password has been changed successfully."
          : "Password has been added to your account. You can now use it to log in.",
        duration: 3000,
      });

      // Clear form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof FormErrors] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        toast.error("Error", {
          description: "Failed to update password. Please try again.",
          duration: 3000,
        });
      }
    }
  };

  const handleVerify2FA = async (code: string) => {
    if (!twoFactorData) return;

    try {
      setIsVerifying(true);
      setError(null);

      // Send 2FA verification to the same endpoint
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factorId: twoFactorData.factorId,
          code,
          newPassword: twoFactorData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Too many attempts", {
            description: "Please wait a moment before trying again.",
            duration: 4000,
          });
          return;
        }

        setError(data.error || "Failed to verify code");
        return;
      }

      // Success
      toast.success(hasPasswordAuth ? "Password updated" : "Password added", {
        description: hasPasswordAuth
          ? "Your password has been changed successfully."
          : "Password has been added to your account. You can now use it to log in.",
        duration: 3000,
      });

      // Clear form and state
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTwoFactorData(null);
      setShowTwoFactorDialog(false);
    } catch (err) {
      console.error("Error verifying 2FA:", err);
      setError("Failed to verify code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEnable2FA = async (
    method: TTwoFactorMethod = "authenticator"
  ) => {
    try {
      if (!user?.auth.twoFactorEnabled) {
        const response = await fetch("/api/auth/2fa/enroll", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ method }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to start 2FA enrollment");
        }

        const data = await response.json();
        setSetupData({
          qrCode: data.qr_code,
          secret: data.secret,
          factorId: data.factor_id,
          method,
        });
        setShowSetupDialog(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleVerify = async (
    method: TTwoFactorMethod,
    code: string,
    phone?: string
  ) => {
    if (!setupData) return;

    setIsVerifying(true);
    setError(null);

    try {
      // If this is the initial SMS setup, we need to enroll the phone number first
      if (method === "sms" && phone) {
        const enrollResponse = await fetch("/api/auth/2fa/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method,
            phone,
          }),
        });

        if (!enrollResponse.ok) {
          const data = await enrollResponse.json();
          throw new Error(data.error || "Failed to enroll phone number");
        }

        // Update setup data with new factor ID if provided
        const enrollData = await enrollResponse.json();
        if (enrollData.factor_id) {
          setSetupData((prev) => ({
            ...prev!,
            factorId: enrollData.factor_id,
          }));
        }

        // Return early as the SMS will be sent
        return;
      }

      // Verify the code
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factorId: setupData.factorId,
          method: setupData.method,
          code,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to verify code");
      }

      // Success! Close dialog and refresh user data
      setShowSetupDialog(false);
      setSetupData(null);

      // Show success message
      toast.success("2FA Enabled", {
        description:
          "Two-factor authentication has been enabled for your account.",
      });

      // Refresh user data to update 2FA status
      await useUserStore.getState().fetchUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    return;
  };

  return (
    <div className="flex flex-col gap-8">
      <SettingCard
        icon={KeyRound}
        title={hasPasswordAuth ? "Change password" : "Add password"}
        description={
          hasPasswordAuth
            ? "Update your account password."
            : "Add a password to your account. You'll still be able to use your current login method."
        }
        footer={
          <Button type="submit" form="password-form" disabled={isLoading}>
            {hasPasswordAuth ? "Update password" : "Add password"}
          </Button>
        }
      >
        <form
          id="password-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          {hasPasswordAuth && (
            <FormField
              id="currentPassword"
              label="Current password"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              disabled={isLoading}
              error={errors.currentPassword}
            />
          )}
          <FormField
            id="newPassword"
            label="New password"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            disabled={isLoading}
            error={errors.newPassword}
          />
          <FormField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            error={errors.confirmPassword}
          />
          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? hasPasswordAuth
                  ? "Updating password..."
                  : "Adding password..."
                : hasPasswordAuth
                  ? "Update password"
                  : "Add password"}
            </Button>
            {hasPasswordAuth && (
              <div className="text-center">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}
          </div>
        </form>
      </SettingCard>

      {AUTH_CONFIG.twoFactorAuth.enabled && (
        <SettingCard
          icon={ShieldIcon}
          title="Two-factor authentication"
          description="Add an extra layer of security to your account."
        >
          <Button
            variant="outline"
            onClick={
              user?.auth.twoFactorEnabled
                ? handleDisable2FA
                : () => handleEnable2FA()
            }
          >
            {user?.auth.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
          </Button>
        </SettingCard>
      )}

      {setupData && (
        <TwoFactorSetupDialog
          open={showSetupDialog}
          onOpenChange={setShowSetupDialog}
          qrCode={setupData.qrCode || ""}
          secret={setupData.secret || ""}
          onVerify={handleVerify}
          error={error}
          isVerifying={isVerifying}
        />
      )}

      {showTwoFactorDialog && twoFactorData && (
        <Dialog
          open={showTwoFactorDialog}
          onOpenChange={setShowTwoFactorDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify your identity</DialogTitle>
              <DialogDescription>
                Please enter your two-factor authentication code to continue.
              </DialogDescription>
            </DialogHeader>
            <TwoFactorVerifyForm
              factorId={twoFactorData.factorId}
              availableMethods={twoFactorData.availableMethods}
              onVerify={handleVerify2FA}
              isVerifying={isVerifying}
              error={error}
            />
          </DialogContent>
        </Dialog>
      )}

      <SettingCard
        icon={ShieldIcon}
        title="Manage devices"
        description="Manage the devices you're logged into."
      >
        <DeviceList />
      </SettingCard>
    </div>
  );
}

interface DeviceItemProps {
  deviceName: string;
  browser: string;
  deviceIcon: React.ReactNode;
  lastActive: Date;
  sessionId: string;
  onRevoke: (sessionId: string) => void;
}

function DeviceItem({
  deviceName,
  browser,
  deviceIcon,
  lastActive,
  sessionId,
  onRevoke,
}: DeviceItemProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center justify-between cursor-pointer border hover:bg-accent p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-8 h-8">{deviceIcon}</div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{deviceName}</h3>
                <DeviceStatus lastActive={lastActive} />
              </div>
              <p className="text-sm text-muted-foreground">{browser}</p>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="sr-only">
          <DialogTitle>{deviceName}</DialogTitle>
          <DialogDescription>
            This device is currently logged into your account.
          </DialogDescription>
        </DialogHeader>
        <InfoItem label="Device name" value={deviceName} />
        <InfoItem label="Browser" value={browser} />
        <InfoItem label="Last active" value={formatRelativeTime(lastActive)} />
        <DialogFooter>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => onRevoke(sessionId)}
          >
            Log out from this device
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeviceStatus({ lastActive }: { lastActive: Date }) {
  const isActive = isDeviceSessionActive(lastActive);
  const lastActiveText = formatRelativeTime(lastActive);

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "w-2 h-2 rounded-full cursor-pointer",
            isActive ? "bg-green-500" : "bg-red-500"
          )}
        />
      </TooltipTrigger>
      <TooltipContent>
        {isActive ? "Currently active" : `Last active ${lastActiveText}`}
      </TooltipContent>
    </Tooltip>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function DeviceList() {
  const { sessions, isLoading, error, refresh } = useDeviceSessions();
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    factorId: string;
    availableMethods: Array<{ type: TTwoFactorMethod; factorId: string }>;
    sessionId: string;
  } | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleRevoke = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/auth/device-sessions/${sessionId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Too many attempts", {
            description: "Please wait a moment before trying again.",
            duration: 4000,
          });
          return;
        }

        toast.error("Error", {
          description: data.error || "Failed to revoke device session",
          duration: 3000,
        });
        return;
      }

      // Check if 2FA is required
      if (data.requiresTwoFactor) {
        setTwoFactorData({
          factorId: data.factorId,
          availableMethods: data.availableMethods,
          sessionId: sessionId,
        });
        setShowTwoFactorDialog(true);
        return;
      }

      // Success
      toast.success("Device logged out", {
        description: "The device has been logged out successfully.",
        duration: 3000,
      });
      refresh();
    } catch (err) {
      console.error("Error revoking device session:", err);
      toast.error("Error", {
        description: "Failed to revoke device session",
        duration: 3000,
      });
    }
  };

  const handleVerify2FA = async (code: string) => {
    if (!twoFactorData) return;

    try {
      setIsVerifying(true);
      setVerifyError(null);

      // Send 2FA verification to the same endpoint
      const response = await fetch(
        `/api/auth/device-sessions/${twoFactorData.sessionId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            factorId: twoFactorData.factorId,
            code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Too many attempts", {
            description: "Please wait a moment before trying again.",
            duration: 4000,
          });
          return;
        }

        setVerifyError(data.error || "Failed to verify code");
        return;
      }

      // Success
      toast.success("Device logged out", {
        description: "The device has been logged out successfully.",
        duration: 3000,
      });

      // Clear state and refresh list
      setTwoFactorData(null);
      setShowTwoFactorDialog(false);
      refresh();
    } catch (err) {
      console.error("Error verifying 2FA:", err);
      setVerifyError("Failed to verify code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center text-muted-foreground">No devices found</div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {sessions.map((session) => (
          <DeviceItem
            key={session.id}
            sessionId={session.session_id}
            deviceName={session.device.device_name}
            browser={session.device.browser || "Unknown browser"}
            deviceIcon={
              session.device.device_name.toLowerCase().includes("iphone") ||
              session.device.device_name.toLowerCase().includes("android") ? (
                <SmartphoneIcon className="flex-shrink-0 w-8 h-8" />
              ) : (
                <LaptopMinimalIcon className="flex-shrink-0 w-8 h-8" />
              )
            }
            lastActive={new Date(session.last_active)}
            onRevoke={handleRevoke}
          />
        ))}
      </div>

      {showTwoFactorDialog && twoFactorData && (
        <Dialog
          open={showTwoFactorDialog}
          onOpenChange={setShowTwoFactorDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify your identity</DialogTitle>
              <DialogDescription>
                Please enter your two-factor authentication code to continue.
              </DialogDescription>
            </DialogHeader>
            <TwoFactorVerifyForm
              factorId={twoFactorData.factorId}
              availableMethods={twoFactorData.availableMethods}
              onVerify={handleVerify2FA}
              isVerifying={isVerifying}
              error={verifyError}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
