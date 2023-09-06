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

export default function HomePage() {
  const store = useStore();
  const { prompt, snapshot } = store.getSelectedItems();

  return (
    <NoSSR>
      <AppContainer header={<AppHeader />}>
        <PanelContainer
          leftPanel={
            <PromptPanel
              prompt={prompt}
              selectedSnapshotId={store.selectedSnapshotId}
              modelOptions={itemListToSelectOptions(Models)}
              snapshotOptions={snapshotListToSelectOptions(store.snapshots)}
              onPromptValueChange={store.updatePrompt}
              onSelectedSnapshotChange={store.changeSelectedSnapshot}
              onSubmit={store.callLLM}
            />
          }
          rightPanel={
            <CasePanel
              promptVariableNames={prompt.promptVariableNames}
              cases={snapshot.cases}
              onChange={(caseId, variableValues) => store.updateCase(caseId, { variableValues })}
              onAddCase={store.addCase}
              onDelete={store.deleteCase}
            />
          }
        />
      </AppContainer>
    </NoSSR>
  );
}
