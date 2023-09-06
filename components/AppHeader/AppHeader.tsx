import { Title, Flex, Group, Button } from '@mantine/core';
import classes from './AppHeader.module.css';

export const AppHeader: React.FC = () => {
  return (
    <Flex align="center" justify="space-between" className={classes.root}>
      <Title order={1} size="h5">
        Prompt Tester
      </Title>
      <Group>
        <Button size="xs" color="gray" variant="outline">
          Select Prompt
        </Button>
        <Button size="xs" color="teal" variant="outline">
          Create New Prompt
        </Button>
      </Group>
    </Flex>
  );
};
