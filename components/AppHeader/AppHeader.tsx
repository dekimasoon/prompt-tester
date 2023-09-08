import { Title, Flex, Group, Button, Menu, ActionIcon } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import classes from './AppHeader.module.css';
import { Prompt, PromptTesterConfig } from '@/type';

export type AppHeaderProps = {
  config: PromptTesterConfig;
  prompts: Prompt[];
  showConfigButton: boolean;
  onCreateNewPrompt: () => void;
  onChangeSelectedPrompt: (promptId: string) => void;
  onOpenConfig: () => void;
};

export const AppHeader: React.FC<AppHeaderProps> = (props) => {
  return (
    <Flex align="center" justify="space-between" className={classes.root}>
      <Title order={1} size="h4">
        Prompt Tester
      </Title>
      <Group>
        {props.showConfigButton && (
          <ActionIcon size="sm" color="gray" onClick={props.onOpenConfig}>
            <IconSettings />
          </ActionIcon>
        )}
        <Menu>
          <Menu.Target>
            <Button size="xs" color="gray" variant="outline">
              Select Prompt
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {props.prompts.map((x) => (
              <Menu.Item key={x.id} onClick={() => props.onChangeSelectedPrompt(x.id)}>
                {x.name}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
        <Button size="xs" color="teal" variant="outline" onClick={props.onCreateNewPrompt}>
          Create New Prompt
        </Button>
      </Group>
    </Flex>
  );
};
