import { action } from '@storybook/addon-actions';
import { ConfigModal } from './ConfigModal';

export default {
  title: 'ConfigModal',
};

export const Usage = () => (
  <ConfigModal
    configValue={{
      apiKey: '',
      apiBaseURL: '',
      apiVersion: '',
    }}
    onSubmit={action('onSubmit')}
    onCancel={action('onCancel')}
  />
);
