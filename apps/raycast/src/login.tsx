import { Detail, ActionPanel, Action } from "@raycast/api";
import { useSession } from "./auth-client";
import { useEffect, useState } from "react";

export default function Command() {
  const { data, isPending } = useSession();

  if (isPending) {
    return <Detail isLoading={true} />;
  }

  if (data?.session) {
    return (
      <Detail
        markdown={`# Welcome ${data?.user.email}`}
        actions={
          <ActionPanel>
            <Action title="Logout" onAction={() => {}} />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <Detail
      markdown="# Login to WordDirectory"
      actions={
        <ActionPanel>
          <Action title="Login" onAction={() => {}} />
        </ActionPanel>
      }
    />
  );
}
