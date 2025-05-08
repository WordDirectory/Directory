import { Form, ActionPanel, Action, useNavigation, Detail, showToast } from "@raycast/api";

export default function Command() {
  const { push } = useNavigation();

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Define"
            shortcut={{ modifiers: ["cmd"], key: "enter" }}
            onSubmit={async (values) => {
              // Get definition from your API
              // Then push to a detail view:
              push(<DefinitionView word={values.word} definition="..." />);
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="word"
        title="Word"
        placeholder="Enter a word to define..."
        autoFocus
      />
    </Form>
  );
}

function DefinitionView({ word, definition }: { word: string; definition: string }) {
  return (
    <Detail
      navigationTitle={word}
      markdown={`# ${word}`}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Definition" text={definition} />
          {/* You can add more structured data like: */}
          <Detail.Metadata.Separator />
          <Detail.Metadata.TagList title="Part of Speech">
            <Detail.Metadata.TagList.Item text="Coming soon" color={"secondaryText"} />
          </Detail.Metadata.TagList>
        </Detail.Metadata>
      }
    />
  );
}
