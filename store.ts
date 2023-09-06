import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 } from 'uuid';
import { Case, Model, Models, Prompt, Snapshot } from './type';
import { getCallLLMRequestBodies, getItem, getVariableNames, updateItemList } from './util';

export type ClientStatus = {
  prompts: Prompt[];
  selectedPromptId: string;
  snapshots: Snapshot[];
  selectedSnapshotId: string;
  availableModels: Model[];
  isCallingLLM: boolean;
};

export type StoreActions = {
  getSelectedItems: () => { prompt: Prompt; snapshot: Snapshot };
  createPrompt: () => void;
  updatePrompt: (value: Omit<Prompt, 'id' | 'promptVariableNames'>) => void;
  addCase: () => void;
  // loadCasesFromCSV: () => void;
  updateCase: (caseId: string, value: Partial<Omit<Case, 'id'>>) => void;
  deleteCase: (caseId: string) => void;
  changeSelectedPrompt: (value: string) => void;
  changeSelectedSnapshot: (value: string) => void;
  callLLM: () => Promise<void>;
};

export const createSamplePromptAndSnapshot = () => {
  const newPrompt = createNewPrompt(0, Models);
  const promptText =
    'Summarize the text below as a bullet point list of the most important points.\n\nText:\n{{Text}}';
  const samplePrompt: Prompt = {
    ...newPrompt,
    name: 'Sample Prompt',
    promptText,
    promptVariableNames: ['Text'],
  };
  const newSnapshot = createNewSnapshot(samplePrompt);
  const newCase = createNewCase(samplePrompt);
  newCase.variableValues = [
    {
      name: 'Text',
      value:
        "If you're new to using the OpenAI API, there are a few resources we suggest exploring. Our Quickstart Tutorial and Completion guide are great places to start. You can also refer to our Examples page to find prompt templates most similar to your use case, which you can then tweak as needed.\nFor more detailed guidance on prompt engineering and best practices using the OpenAI API, please consult this help article.\nFinally, we encourage you to visit our community forum, where you can ask questions, share tips, and connect with fellow API users.",
    },
  ];
  newSnapshot.cases = [newCase];
  return { prompt: samplePrompt, snapshot: newSnapshot };
};

export const createNewPrompt = (promptIndex: number, models: Model[]) => {
  const prompt: Prompt = {
    id: `p:${v4()}`,
    name: `Prompt${promptIndex}`,
    promptText: '',
    promptVariableNames: [],
    temperature: 0,
    modelId: models[0].id,
    systemPromptText: '',
  };
  return prompt;
};

export const createNewSnapshot = (prompt: Prompt): Snapshot => {
  const snapshot: Snapshot = {
    id: `s:${v4()}`,
    recordedAt: null,
    promptId: prompt.id,
    promptWithoutName: null,
    cases: [],
    isArchived: false,
  };
  return snapshot;
};

export const createNewCase = (prompt: Prompt): Case => {
  return {
    id: `c:${v4()}`,
    variableValues: prompt.promptVariableNames.map((x) => ({ name: x, value: '' })),
    result: '',
  };
};

export const useStore = create<ClientStatus & StoreActions>()(
  devtools(
    persist(
      (set, get) => {
        const sample = createSamplePromptAndSnapshot();
        return {
          prompts: [sample.prompt],
          selectedPromptId: sample.prompt.id,
          snapshots: [sample.snapshot],
          selectedSnapshotId: sample.snapshot.id,
          availableModels: [...Models],
          isCallingLLM: false as boolean,

          getSelectedItems() {
            const prompt = getItem(get().selectedPromptId, get().prompts) ?? sample.prompt;
            const snapshot = getItem(get().selectedSnapshotId, get().snapshots) ?? sample.snapshot;
            return { prompt, snapshot };
          },

          createPrompt() {
            const prompts = get().prompts;
            const newPrompt = createNewPrompt(prompts.length, get().availableModels);
            const newSnapshot = createNewSnapshot(newPrompt);
            set({
              prompts: [newPrompt, ...prompts],
              snapshots: [newSnapshot, ...get().snapshots],
              selectedSnapshotId: newSnapshot.id,
            });
          },

          updatePrompt(value) {
            const promptVariableNames = getVariableNames(value.promptText);
            const updatedPrompts = updateItemList(
              get().prompts,
              get().selectedPromptId,
              (x) => ({ ...x, ...value, promptVariableNames }),
              true
            );
            set({
              prompts: updatedPrompts,
            });
          },

          addCase() {
            const prompt = getItem(get().selectedPromptId, get().prompts);
            if (!prompt) {
              return;
            }
            const newCase = createNewCase(prompt);
            const updateSnapshots = updateItemList(
              get().snapshots,
              get().selectedSnapshotId,
              (x) => {
                if (x.isArchived) {
                  return x;
                }
                return {
                  ...x,
                  cases: [...x.cases, newCase],
                };
              }
            );
            set({
              snapshots: updateSnapshots,
            });
          },

          updateCase(caseId, value) {
            const updateSnapshots = updateItemList(
              get().snapshots,
              get().selectedSnapshotId,
              (x) => {
                if (x.isArchived) {
                  return x;
                }
                const targetCase = x.cases.find((c) => c.id === caseId);
                if (!targetCase) {
                  return x;
                }
                if (value.result) {
                  targetCase.result = value.result;
                }
                if (value.variableValues) {
                  targetCase.variableValues = value.variableValues;
                }
                return {
                  ...x,
                };
              }
            );
            set({
              snapshots: updateSnapshots,
            });
          },

          deleteCase(caseId) {
            const updateSnapshots = updateItemList(
              get().snapshots,
              get().selectedSnapshotId,
              (x) => {
                if (x.isArchived) {
                  return x;
                }
                const newCases = x.cases.filter((c) => c.id !== caseId);
                x.cases = newCases;
                return {
                  ...x,
                };
              }
            );
            set({
              snapshots: updateSnapshots,
            });
          },

          changeSelectedPrompt(id) {
            const prompt = getItem(id, get().prompts);
            if (!prompt) {
              return;
            }
            const snapshot = get().snapshots.find((x) => x.promptId === id && !x.isArchived);
            if (!snapshot) {
              return;
            }
            set({
              selectedPromptId: id,
              selectedSnapshotId: snapshot.id,
            });
          },

          changeSelectedSnapshot(id) {
            const snapshot = getItem(id, get().snapshots);
            if (!snapshot) {
              return;
            }
            set({
              selectedSnapshotId: snapshot.id,
            });
          },

          async callLLM() {
            set({
              isCallingLLM: true,
            });
            const prompt = getItem(get().selectedPromptId, get().prompts);
            const snapshot = getItem(get().selectedSnapshotId, get().snapshots);
            if (!prompt || !snapshot) {
              return;
            }
            const requests = getCallLLMRequestBodies(prompt, snapshot);
            for (const r of requests) {
              const response = await fetch('api/llm', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(r.body),
              });
              const reader = response.body?.getReader();
              if (!reader) {
                return;
              }
              const decoder = new TextDecoder();
              let result = '';
              while (true) {
                const { value, done } = await reader.read();
                if (done) {
                  break;
                }
                result += decoder.decode(value);
                get().updateCase(r.caseId, { result });
              }
            }
            set({
              isCallingLLM: false,
            });
          },
        };
      },
      {
        name: 'prompt-tester-status',
      }
    )
  )
);
