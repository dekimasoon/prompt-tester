'use client';

import {
  Button,
  ComboboxItem,
  Divider,
  Group,
  InputWrapper,
  Modal,
  Select,
  Slider,
  Space,
  Stack,
  TextInput,
  Textarea,
} from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import classes from './PromptPanel.module.css';
import { Prompt } from '@/type';
import { useEffect } from 'react';

export type PromptPanelFormValue = Omit<Prompt, 'id' | 'promptVariableNames'>;

export type PromptPanelProps = {
  prompt: PromptPanelFormValue;
  selectedSnapshotId: string;
  modelOptions: ComboboxItem[];
  snapshotOptions: ComboboxItem[];
  isCallingLLM: boolean;
  isReadOnly: boolean;
  onPromptValueChange: (value: PromptPanelFormValue) => void;
  onSelectedSnapshotChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete: () => void;
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

  const [modalOpened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    props.onPromptValueChange(form.values);
  }, [form.values]);

  useEffect(() => {
    form.setValues(props.prompt);
  }, [props.selectedSnapshotId]);

  return (
    <>
      <Stack className={classes.root}>
        <TextInput
          label="Name"
          placeholder="Your prompt name"
          disabled={props.isCallingLLM}
          readOnly={props.isReadOnly}
          {...form.getInputProps('name')}
        />
        <Textarea
          autosize
          label="Prompt"
          placeholder="You can define prompt variables by using the `{{}}` symbol. For example, `{{text}}`."
          minRows={8}
          maxRows={12}
          disabled={props.isCallingLLM}
          readOnly={props.isReadOnly}
          {...form.getInputProps('promptText')}
        />
        <Group justify="space-between">
          <Button
            size="xs"
            color="red"
            variant="outline"
            loading={props.isCallingLLM}
            disabled={props.isReadOnly}
            onClick={open}
          >
            Delete
          </Button>
          <Group justify="flex-end">
            {props.isCallingLLM && (
              <Button size="xs" color="gray" variant="outline" onClick={props.onCancel}>
                Cancel
              </Button>
            )}
            <Button
              size="xs"
              color="teal"
              loading={props.isCallingLLM}
              disabled={props.isReadOnly}
              onClick={props.onSubmit}
            >
              Submit
            </Button>
          </Group>
        </Group>
        <Space />
        <Select
          label="Model"
          placeholder=""
          unselectable="off"
          data={props.modelOptions}
          disabled={props.isCallingLLM}
          readOnly={props.isReadOnly}
          {...form.getInputProps('modelId')}
        />
        <InputWrapper label="Temperature">
          <Slider
            min={0}
            max={2}
            step={0.01}
            disabled={props.isCallingLLM || props.isReadOnly}
            {...form.getInputProps('temperature')}
          />
        </InputWrapper>
        <TextInput
          label="System Prompt"
          placeholder="You are helpful assistant"
          disabled={props.isCallingLLM}
          readOnly={props.isReadOnly}
          {...form.getInputProps('systemPromptText')}
        />
        <Divider my="lg" />
        <Select
          label="Versions"
          placeholder=""
          unselectable="off"
          data={props.snapshotOptions}
          value={props.selectedSnapshotId}
          disabled={props.isCallingLLM}
          onChange={(value) => value && props.onSelectedSnapshotChange(value)}
        />
      </Stack>
      <Modal
        opened={modalOpened}
        onClose={close}
        title={`Are you sure you want to delete '${props.prompt.name}'?`}
        centered
      >
        <Group justify="flex-end">
          <Button size="xs" color="gray" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            size="xs"
            color="red"
            variant="outline"
            onClick={() => {
              close();
              props.onDelete();
            }}
          >
            OK
          </Button>
        </Group>
      </Modal>
    </>
  );
};
