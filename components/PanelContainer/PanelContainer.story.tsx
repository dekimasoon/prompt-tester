import React from 'react';
import { PanelContainer } from './PanelContainer';

export default {
  title: 'PanelContainer',
};

const Left: React.FC = () => <div style={{ background: 'red' }}>Left</div>;
const Right: React.FC = () => <div style={{ background: 'blue' }}>Right</div>;

export const Usage = () => <PanelContainer leftPanel={<Left />} rightPanel={<Right />} />;
