import { Detail, ActionPanel, Action } from "@raycast/api";
import { useSession } from "./auth-client";

export default function Command() {
  const { data, isPending, error } = useSession();

  if (isPending) {
    return <Detail isLoading={true} />;
  }

  if (data?.session) {
    return (
      <Detail
        markdown="# Already logged in"
        actions={
          <ActionPanel>
            <Action
              title="Logout"
              onAction={async () => {
                // TODO: Implement logout
              }}
            />
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
          <Action
            title="Login"
            onAction={async () => {
              // TODO: Implement OAuth flow
            }}
          />
        </ActionPanel>
      }
    />
  );
} 