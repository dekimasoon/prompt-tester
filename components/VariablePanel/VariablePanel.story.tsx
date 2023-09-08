import React from 'react';
import { VariablePanel, VariablePanelProps } from './VariablePanel';

export default {
  title: 'VariablePanel',
};

export const Usage = () => {
  const [values, setValues] = React.useState([
    { name: 'Minutes', value: '...' },
    { name: 'MailTemplate', value: '' },
  ]);
  return (
    <VariablePanel
      variableValues={values}
      result=""
      isLoading={true}
      isDisabled={false}
      isReadOnly={false}
      onChange={setValues}
      onDelete={() => {}}
    />
  );
};
