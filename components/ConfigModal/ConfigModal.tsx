import { Button, Group, Space, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { PromptTesterConfig } from '@/type';

export type ConfigModalProps = {
  configValue: PromptTesterConfig;
  onCancel: () => void;
  onSubmit: (value: PromptTesterConfig) => void;
};

export const ConfigModal: React.FC<ConfigModalProps> = (props) => {
  const form = useForm<PromptTesterConfig>({
    initialValues: props.configValue,
    validate: {},
  });
  return (
    <form onSubmit={form.onSubmit(props.onSubmit)}>
      <Stack>
        <TextInput
          label="API Key"
          description="Your OpenAI or Azure OpenAI Service API Key"
          placeholder=""
          {...form.getInputProps('apiKey')}
        />
        <TextInput
          label="API Base URL"
          description="Set when using Azure OpenAI Service or OpenAI proxy."
          placeholder="https://${YOUR_RESOURCE_NAME}.openai.azure.com/openai/deployments/${YOUR_DEPLOYMENT_ID}"
          {...form.getInputProps('apiBaseURL')}
        />
        <TextInput
          label="API Version"
          description="Set when using Azure OpenAI Service."
          placeholder="2023-06-01-preview"
          {...form.getInputProps('apiVersion')}
        />
        <Space />
        <Group justify="flex-end">
          <Button size="xs" variant="outline" color="gray" onClick={props.onCancel}>
            Cancel
          </Button>
          <Button size="xs" variant="outline" color="teal" type="submit">
            Save
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
