'use client';

import { AppContainer } from '@/components/AppContainer/AppContainer';
import { AppHeader } from '@/components/AppHeader/AppHeader';
import { PanelContainer } from '@/components/PanelContainer/PanelContainer';
import { PromptPanel } from '@/components/PromptPanel/PromptPanel';
import { CasePanel } from '@/components/CasePanel/CasePanel';
import { useStore } from '@/store';
import { itemListToSelectOptions, snapshotListToSelectOptions } from '@/util';
import { NoSSR } from '@/components/NoSSR/NoSSR';
import { Models } from '@/type';
import { ConfigModal } from '@/components/ConfigModal/ConfigModal';
import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';

export default function HomePage() {
  const store = useStore();
  const [modalOpened, { open, close }] = useDisclosure(false);
  const { prompt, snapshot, relatedSnapshots } = store.getSelectedItems();

  useEffect(() => {
    store.checkServerSideConfig();
  }, []);

  return (
    <NoSSR>
      <AppContainer
        header={
          <AppHeader
            config={store.config}
            prompts={store.prompts}
            onCreateNewPrompt={store.createPrompt}
            onChangeSelectedPrompt={store.changeSelectedPrompt}
            showConfigButton={!store.isConfigSetOnServerSide}
            onOpenConfig={open}
          />
        }
      >
        <Modal opened={modalOpened} onClose={close} title="Config" centered>
          <ConfigModal
            configValue={store.config}
            onSubmit={(value) => {
              store.updateConfig(value);
              close();
            }}
            onCancel={close}
          />
        </Modal>
        <PanelContainer
          leftPanel={
            <PromptPanel
              prompt={prompt}
              selectedSnapshotId={store.selectedSnapshotId}
              modelOptions={itemListToSelectOptions(Models)}
              snapshotOptions={snapshotListToSelectOptions(relatedSnapshots)}
              isCallingLLM={store.isCallingLLM}
              isReadOnly={snapshot.isArchived}
              onPromptValueChange={store.updatePrompt}
              onSelectedSnapshotChange={store.changeSelectedSnapshot}
              onSubmit={store.callLLM}
              onCancel={store.cancelCallLLM}
              onDelete={store.deletePrompt}
            />
          }
          rightPanel={
            <CasePanel
              promptVariableNames={prompt.promptVariableNames}
              cases={snapshot.cases}
              onChange={(caseId, variableValues) => store.updateCase(caseId, { variableValues })}
              isCallingLLM={store.isCallingLLM}
              isReadOnly={snapshot.isArchived}
              loadingCaseId={store.loadingCaseId}
              onAddCase={store.addCase}
              onDelete={store.deleteCase}
            />
          }
        />
      </AppContainer>
    </NoSSR>
  );
}
