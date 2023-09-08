import { ActionIcon, LoadingOverlay, Stack, Textarea } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import classes from './VariablePanel.module.css';
import { VariableValue } from '@/type';

export type VariablePanelProps = {
  variableValues: VariableValue[];
  result: string;
  isLoading: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  onChange: (value: VariableValue[]) => void;
  onDelete: () => void;
};

export const VariablePanel: React.FC<VariablePanelProps> = (props) => (
  <div className={props.variableValues.length > 0 ? classes.root : classes.noVariablesRoot}>
    {props.variableValues.length > 0 && (
      <Stack gap={12}>
        {props.variableValues.map((x, i) => (
          <Textarea
            key={x.name}
            placeholder={x.name}
            classNames={{
              root: classes.height100,
              wrapper: classes.height100,
              input: classes.height100,
            }}
            value={x.value}
            disabled={props.isDisabled || props.isLoading}
            readOnly={props.isReadOnly}
            onChange={(e) => {
              const newValue = [...props.variableValues];
              newValue[i].value = e.currentTarget.value;
              props.onChange(newValue);
            }}
          />
        ))}
      </Stack>
    )}
    <div className={classes.result}>
      <LoadingOverlay
        visible={props.isLoading}
        zIndex={1000}
        overlayProps={{ blur: 0, backgroundOpacity: 0.2 }}
      />
      {props.result}
    </div>
    <ActionIcon
      className={classes.trashIcon}
      size="sm"
      color="gray"
      onClick={props.onDelete}
      disabled={props.isDisabled || props.isLoading || props.isReadOnly}
    >
      <IconTrash />
    </ActionIcon>
  </div>
);
