"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Suspense } from "react";

function MessageProviderContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      toast(decodeURIComponent(message));
    }
  }, [searchParams]);

  return null;
}

export function MessageProvider() {
  return (
    <Suspense>
      <MessageProviderContent />
    </Suspense>
  );
}
