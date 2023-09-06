import React from 'react';
import { AppContainer } from './AppContainer';

export default {
  title: 'AppContainer',
};

const Header: React.FC = () => <div style={{ background: 'red' }}>Header</div>;
const Child: React.FC = () => <div style={{ background: 'blue' }}>Child</div>;

export const Usage = () => (
  <AppContainer header={<Header />}>
    <Child />
  </AppContainer>
);
