import { Button, Group, InputWrapper, Stack, Text, Textarea, px } from '@mantine/core';
import classes from './CasePanel.module.css';
import { VariablePanel } from '../VariablePanel/VariablePanel';
import { Case, Prompt, VariableValue } from '../../type';
import { getValidVariableValues } from '../..//util';

export type CasePanelProps = {
  promptVariableNames: Prompt['promptVariableNames'];
  cases: Case[];
  isCallingLLM: boolean;
  loadingCaseId: string | null;
  isReadOnly: boolean;
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
          isDisabled={props.isCallingLLM}
          isReadOnly={props.isReadOnly}
          isLoading={props.loadingCaseId === x.id}
          onChange={(value) => props.onChange(x.id, value)}
          onDelete={() => props.onDelete(x.id)}
        />
      ))}
      <Group justify="space-between">
        <Button
          size="xs"
          color="gray"
          variant="outline"
          onClick={props.onAddCase}
          disabled={props.isCallingLLM || props.isReadOnly}
        >
          Add Case
        </Button>
      </Group>
    </Stack>
  </InputWrapper>
);
