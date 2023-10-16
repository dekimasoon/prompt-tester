import React from 'react';
import { action } from '@storybook/addon-actions';
import { VariablePanel } from './VariablePanel';

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
      isLoading
      isDisabled={false}
      isReadOnly={false}
      onChange={setValues}
      onDelete={action('onDelete')}
      onRetry={action('onRetry')}
    />
  );
};
