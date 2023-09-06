'use client';

import {
  Button,
  ComboboxItem,
  Divider,
  Group,
  InputWrapper,
  Select,
  Slider,
  Stack,
  TextInput,
  Textarea,
} from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import classes from './PromptPanel.module.css';
import { Prompt } from '@/type';
import { useEffect } from 'react';

export type PromptPanelFormValue = Omit<Prompt, 'id' | 'promptVariableNames'>;

export type PromptPanelProps = {
  prompt: PromptPanelFormValue;
  selectedSnapshotId: string;
  modelOptions: ComboboxItem[];
  snapshotOptions: ComboboxItem[];
  onPromptValueChange: (value: PromptPanelFormValue) => void;
  onSelectedSnapshotChange: (value: string) => void;
  onSubmit: () => void;
};

export const PromptPanel: React.FC<PromptPanelProps> = (props) => {
  const form = useForm<PromptPanelFormValue>({
    initialValues: props.prompt,
    validate: {
      name: isNotEmpty(),
      promptText: isNotEmpty(),
      modelId: isNotEmpty(),
    },
  });

  useEffect(() => {
    props.onPromptValueChange(form.values);
  }, [form.values]);
  return (
    <Stack className={classes.root}>
      <TextInput label="Name" placeholder="Your prompt name" {...form.getInputProps('name')} />
      <Textarea
        autosize
        label="Prompt"
        placeholder="You can define prompt variables by using the `{{}}` symbol. For example, `{{text}}`."
        minRows={8}
        maxRows={12}
        {...form.getInputProps('promptText')}
      />
      <Group justify="flex-end">
        <Button size="xs" color="teal" onClick={props.onSubmit}>
          Submit
        </Button>
      </Group>
      <Select
        label="Model"
        placeholder=""
        unselectable="off"
        data={props.modelOptions}
        {...form.getInputProps('modelId')}
      />
      <InputWrapper label="Temperature">
        <Slider min={0} max={2} step={0.01} {...form.getInputProps('temperature')} />
      </InputWrapper>
      <TextInput
        label="System Prompt"
        placeholder="You are helpful assistant"
        {...form.getInputProps('systemPromptText')}
      />
      <Divider my="lg" />
      <Select
        label="Versions"
        placeholder=""
        unselectable="off"
        data={props.snapshotOptions}
        value={props.selectedSnapshotId}
        onChange={(value) => value && props.onSelectedSnapshotChange(value)}
      />
    </Stack>
  );
};
