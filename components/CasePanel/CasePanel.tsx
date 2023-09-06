import { Button, Group, InputWrapper, Stack, Text, Textarea, px } from '@mantine/core';
import classes from './CasePanel.module.css';
import { VariablePanel } from '../VariablePanel/VariablePanel';
import { Case, Prompt, VariableValue } from '../../type';
import { getValidVariableValues } from '../..//util';

export type CasePanelProps = {
  promptVariableNames: Prompt['promptVariableNames'];
  cases: Case[];
  onChange: (caseId: string, variableValues: VariableValue[]) => void;
  onDelete: (caseId: string) => void;
  onAddCase: () => void;
};

export const CasePanel: React.FC<CasePanelProps> = (props) => (
  <InputWrapper label="Cases">
    <Stack gap={32}>
      {props.cases.map((x) => (
        <VariablePanel
          key={x.id}
          variableValues={getValidVariableValues(x, props.promptVariableNames)}
          result={x.result}
          onChange={(value) => props.onChange(x.id, value)}
          onDelete={() => props.onDelete(x.id)}
        />
      ))}
      <Group justify="space-between">
        <Button size="xs" color="gray" variant="outline" onClick={props.onAddCase}>
          Add Case
        </Button>
        {/* <Button size="xs" color="gray" variant="outline">
          Load Cases from CSV
        </Button> */}
      </Group>
    </Stack>
  </InputWrapper>
);
