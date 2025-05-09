import { Detail, ActionPanel, Action, open } from "@raycast/api";
import { useSession } from "./auth-client";
import { useEffect, useState } from "react";

export default function Command() {
  const { data, isPending } = useSession();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!data?.session);
  }, [data]);

  if (isPending) {
    return <Detail isLoading={true} />;
  }

  if (isLoggedIn) {
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
