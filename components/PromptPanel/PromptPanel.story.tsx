import React from 'react';
import { action } from '@storybook/addon-actions';
import { PromptPanel, PromptPanelFormValue } from './PromptPanel';
import { itemListToSelectOptions } from '../../util';
import { Models } from '../../type';

export default {
  title: 'PromptPanel',
};

export const Usage = () => {
  const [prompt, setPrompt] = React.useState<PromptPanelFormValue>({
    name: 'Prompt1',
    promptText: 'promptText',
    modelId: 'gpt35',
    temperature: 0,
    systemPromptText: '',
  });
  const [snapshotId, setSnapshotId] = React.useState('s:1');
  return (
    <PromptPanel
      prompt={prompt}
      selectedSnapshotId={snapshotId}
      modelOptions={itemListToSelectOptions(Models)}
      snapshotOptions={[{ label: 'latest', value: 's:1' }]}
      onPromptValueChange={setPrompt}
      onSelectedSnapshotChange={setSnapshotId}
      isCallingLLM
      showModelOption
      isReadOnly={false}
      onSubmit={action('onSubmit')}
      onCancel={action('onCancel')}
      onDelete={action('onDelete')}
    />
  );
};
