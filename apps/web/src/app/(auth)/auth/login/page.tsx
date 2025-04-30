import { AuthForm } from "@/components/auth-form";
import { BackButton } from "@/components/back-button";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center py-16 px-8 relative">
      <div className="absolute top-0 left-0 p-4">
        <BackButton redirect="/" />
      </div>
      <AuthForm mode="login" />
    </div>
  );
}
