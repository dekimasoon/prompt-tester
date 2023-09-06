import React from 'react';
import { CasePanel } from './CasePanel';
import { Case } from '../../type';

export default {
  title: 'CasePanel',
};

export const Usage = () => {
  const promptVariableNames = ['a', 'c'];
  const [cases, setCases] = React.useState<Case[]>([
    {
      id: `c:1`,
      variableValues: [
        {
          name: 'a',
          value: 'aaa1',
        },
        {
          name: 'b',
          value: 'bbb1',
        },
        {
          name: 'c',
          value: 'ccc1',
        },
      ],
      result: 'result',
    },
    {
      id: `c:2`,
      variableValues: [
        {
          name: 'a',
          value: 'aaa2',
        },
      ],
      result: 'result2',
    },
  ]);
  return (
    <CasePanel
      promptVariableNames={promptVariableNames}
      cases={cases}
      onChange={(caseId, variableValues) => {
        const targetCaseIndex = cases.findIndex((x) => x.id === caseId);
        const targetCase = cases[targetCaseIndex];
        targetCase.variableValues = variableValues;
        setCases([...cases]);
      }}
      onAddCase={() => {}}
    />
  );
};
