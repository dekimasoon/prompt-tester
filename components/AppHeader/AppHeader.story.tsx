import { action } from '@storybook/addon-actions';
import { AppHeader } from './AppHeader';

export default {
  title: 'AppHeader',
};

export const Usage = () => (
  <AppHeader
    config={{
      apiKey: '',
      apiBaseURL: '',
      apiVersion: '',
    }}
    prompts={[]}
    showConfigButton={true}
    onChangeSelectedPrompt={action('onChangeSelectedPrompt')}
    onCreateNewPrompt={action('onCreateNewPrompt')}
    onOpenConfig={action('onOpenConfig')}
  />
);
