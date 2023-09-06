import { ActionIcon, Stack, Textarea } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import classes from './VariablePanel.module.css';
import { VariableValue } from '@/type';

export type VariablePanelProps = {
  variableValues: VariableValue[];
  result: string;
  onChange: (value: VariableValue[]) => void;
  onDelete: () => void;
};

export const VariablePanel: React.FC<VariablePanelProps> = (props) => (
  <div className={classes.root}>
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
          onChange={(e) => {
            const newValue = [...props.variableValues];
            newValue[i].value = e.currentTarget.value;
            props.onChange(newValue);
          }}
        />
      ))}
    </Stack>
    <div className={classes.result}>{props.result}</div>
    <ActionIcon className={classes.trashIcon} size="sm" color="gray" onClick={props.onDelete}>
      <IconTrash />
    </ActionIcon>
  </div>
);
