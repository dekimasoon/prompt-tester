import { useState } from 'react';
import { Button, Group, InputWrapper, Stack, Switch } from '@mantine/core';
import classes from './CasePanel.module.css';
import { VariablePanel } from '../VariablePanel/VariablePanel';
import { Case, Prompt, VariableValue } from '../../type';
import { getValidVariableValues } from '../../util';

export type CasePanelProps = {
  promptVariableNames: Prompt['promptVariableNames'];
  cases: Case[];
  isCallingLLM: boolean;
  loadingCaseId: string | null;
  isReadOnly: boolean;
  onChange: (caseId: string, variableValues: VariableValue[]) => void;
  onDelete: (caseId: string) => void;
  onRetry: (caseId: string) => void;
  onAddCase: () => void;
  onDownloadCSV: () => void;
};

export const CasePanel: React.FC<CasePanelProps> = (props) => {
  const [isExtractJSON, setIsExtractJSON] = useState(false);
  return (
    <InputWrapper label="Cases" className={classes.root}>
      <Stack gap={32}>
        {props.cases.map((x) => (
          <VariablePanel
            key={x.id}
            variableValues={getValidVariableValues(x, props.promptVariableNames)}
            result={isExtractJSON ? x.extractJsonResult : x.result}
            isDisabled={props.isCallingLLM}
            isReadOnly={props.isReadOnly}
            isLoading={props.loadingCaseId === x.id}
            onChange={(value) => props.onChange(x.id, value)}
            onDelete={() => props.onDelete(x.id)}
            onRetry={() => props.onRetry(x.id)}
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
          <Group>
            <Switch
              label="Extract JSON"
              checked={isExtractJSON}
              onChange={(event) => setIsExtractJSON(event.currentTarget.checked)}
            />
            <Button size="xs" color="gray" variant="outline" onClick={props.onDownloadCSV}>
              Download CSV
            </Button>
          </Group>
        </Group>
      </Stack>
    </InputWrapper>
  );
};
