import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 } from 'uuid';
import { notifications } from '@mantine/notifications';
import OpenAI from 'openai';
import { stringify } from 'csv-stringify/sync';
import dayjs from 'dayjs';
import { Case, Model, Models, Prompt, PromptTesterConfig, Snapshot } from './type';
import {
  extractJSON,
  getCallLLMRequestBody,
  getItem,
  getVariableNames,
  replacePromptVariables,
  updateItemList,
} from './util';

export type ClientStatus = {
  config: PromptTesterConfig;
  isApiKeySetOnServerSide: boolean;
  isApiVersionSet: boolean;
  prompts: Prompt[];
  selectedPromptId: string;
  snapshots: Snapshot[];
  selectedSnapshotId: string;
  availableModels: Model[];
  isCallingLLM: boolean;
  loadingCaseId: string | null;
  callingLLMAbortController: AbortController | null;
};

export type StoreActions = {
  getSelectedItems: () => { prompt: Prompt; snapshot: Snapshot; relatedSnapshots: Snapshot[] };
  updateConfig: (value: PromptTesterConfig) => void;
  createPrompt: () => void;
  updatePrompt: (value: Omit<Prompt, 'id' | 'promptVariableNames'>) => void;
  deletePrompt: () => void;
  addCase: () => void;
  updateCase: (caseId: string, value: Partial<Omit<Case, 'id'>>) => void;
  deleteCase: (caseId: string) => void;
  changeSelectedPrompt: (promptId: string) => void;
  changeSelectedSnapshot: (snapshotId: string) => void;
  createCurrentSnapshot: () => void;
  callLLM: () => Promise<void>;
  callLLMbyCase: (caseId: string) => Promise<void>;
  cancelCallLLM: () => void;
  checkServerSideConfig: () => Promise<void>;
  downloadCSV: () => void;
};

export type StorePrivateAction = {
  _callLLMInner: (
    abortController: AbortController,
    prompt: Prompt,
    targetCase: Case
  ) => Promise<void>;
  _beforeCallLLM: () => { prompt: Prompt | null; snapshot: Snapshot | null };
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
    promptText: 'Your Prompt Here\n\n{{SomeVariable}}',
    promptVariableNames: ['SomeVariable'],
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
    cases: [createNewCase(prompt)],
    isArchived: false,
  };
  return snapshot;
};

export const createNewCase = (prompt: Prompt): Case => ({
  id: `c:${v4()}`,
  variableValues: prompt.promptVariableNames.map((x) => ({ name: x, value: '' })),
  result: '',
  extractJsonResult: '',
});

export const useStore = create<ClientStatus & StoreActions & StorePrivateAction>()(
  devtools(
    persist(
      (set, get) => {
        const sample = createSamplePromptAndSnapshot();
        return {
          config: {
            apiKey: '',
            apiBaseURL: '',
            apiVersion: '',
          },
          isApiKeySetOnServerSide: false as boolean,
          isApiVersionSet: false as boolean,
          prompts: [sample.prompt],
          selectedPromptId: sample.prompt.id,
          snapshots: [sample.snapshot],
          selectedSnapshotId: sample.snapshot.id,
          availableModels: [...Models],
          isCallingLLM: false as boolean,
          loadingCaseId: null as string | null,
          callingLLMAbortController: null as AbortController | null,

          getSelectedItems() {
            const prompt = getItem(get().selectedPromptId, get().prompts) ?? sample.prompt;
            const snapshot = getItem(get().selectedSnapshotId, get().snapshots) ?? sample.snapshot;
            return {
              prompt,
              snapshot,
              relatedSnapshots: get().snapshots.filter((x) => x.promptId === prompt.id),
            };
          },

          updateConfig(value) {
            set({
              config: value,
              isApiVersionSet: value.apiVersion !== '',
            });
          },

          createPrompt() {
            const { prompts } = get();
            const newPrompt = createNewPrompt(prompts.length, get().availableModels);
            const newSnapshot = createNewSnapshot(newPrompt);
            set({
              prompts: [newPrompt, ...prompts],
              snapshots: [newSnapshot, ...get().snapshots],
              selectedPromptId: newPrompt.id,
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

          deletePrompt() {
            if (get().prompts.length === 1) {
              return;
            }
            const currentPromptId = get().selectedPromptId;
            const prompts = get().prompts.filter((x) => x.id !== currentPromptId);
            get().changeSelectedPrompt(prompts[0].id);
            set({
              prompts,
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
                if (value.result !== undefined) {
                  targetCase.result = value.result;
                }
                if (value.variableValues !== undefined) {
                  targetCase.variableValues = value.variableValues;
                }
                if (value.extractJsonResult !== undefined) {
                  targetCase.extractJsonResult = value.extractJsonResult;
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
                // eslint-disable-next-line no-param-reassign
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

          createCurrentSnapshot() {
            const prompt = getItem(get().selectedPromptId, get().prompts);
            const snapshot = getItem(get().selectedSnapshotId, get().snapshots);
            if (!prompt || !snapshot) {
              return;
            }
            const { name, ...promptWithoutName } = structuredClone(prompt);
            const newSnapshot: Snapshot = {
              ...structuredClone(snapshot),
              id: `s:${v4()}`,
              isArchived: true,
              recordedAt: new Date(),
              promptWithoutName,
            };

            const [latest, ...others] = get().snapshots;
            set({
              snapshots: [latest, newSnapshot, ...others],
            });
          },
          async callLLMbyCase(caseId) {
            const { prompt, snapshot } = get()._beforeCallLLM();
            if (!prompt || !snapshot) {
              return;
            }
            const targetCase = snapshot.cases.find((x) => x.id === caseId);
            if (!targetCase) {
              return;
            }
            const abortController = new AbortController();
            try {
              await get()._callLLMInner(abortController, prompt, targetCase);
            } catch (e) {
              if (!abortController.signal.aborted) {
                get().updateCase(targetCase.id, {
                  result: '[ERROR] Request failed',
                  extractJsonResult: '',
                });
              }
            }
            set({
              loadingCaseId: null,
              isCallingLLM: false,
              callingLLMAbortController: null,
            });
          },

          async callLLM() {
            const { prompt, snapshot } = get()._beforeCallLLM();
            if (!prompt || !snapshot) {
              return;
            }
            // eslint-disable-next-line no-restricted-syntax
            for (const [index, c] of Object.entries(snapshot.cases)) {
              const abortController = new AbortController();
              try {
                // eslint-disable-next-line no-await-in-loop
                await get()._callLLMInner(abortController, prompt, c);
              } catch (e) {
                console.log(e);
                if (abortController.signal.aborted) {
                  break;
                }
                notifications.show({
                  color: 'red',
                  message: `Skip case #${Number(index) + 1} due to request to LLM failing`,
                  autoClose: 5_000,
                });
                get().updateCase(c.id, { result: '[ERROR] Request failed', extractJsonResult: '' });
              }
            }
            set({
              loadingCaseId: null,
              isCallingLLM: false,
              callingLLMAbortController: null,
            });
            get().createCurrentSnapshot();
          },

          async _callLLMInner(abortController, prompt, targetCase) {
            set({
              loadingCaseId: targetCase.id,
              callingLLMAbortController: abortController,
            });
            get().updateCase(targetCase.id, { result: '', extractJsonResult: '' });
            const sendFromServer = get().isApiKeySetOnServerSide;
            const requestBody = getCallLLMRequestBody(prompt, targetCase, get().config);
            if (sendFromServer) {
              const response = await fetch('api/llm', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: abortController.signal,
              });
              const body = await response.json();
              const extractJsonResult = extractJSON(body.result);
              get().updateCase(targetCase.id, { result: body.result, extractJsonResult });
            } else {
              const { config } = get();
              const client = new OpenAI({
                apiKey: config.apiKey,
                baseURL: config.apiBaseURL || undefined,
                defaultQuery: config.apiVersion ? { 'api-version': config.apiVersion } : undefined,
                defaultHeaders: { 'api-key': config.apiKey },
                maxRetries: 2,
                dangerouslyAllowBrowser: true,
              });
              const model = Models.find((x) => x.id === requestBody.request.modelId);
              const userMessage = {
                role: 'user',
                content: requestBody.request.userPrompt,
              } as const;
              const response = await client.chat.completions.create(
                {
                  model: model!.apiName,
                  messages: requestBody.request.systemPrompt
                    ? [{ role: 'system', content: requestBody.request.systemPrompt }, userMessage]
                    : [userMessage],
                  temperature: requestBody.request.temperature,
                },
                {
                  signal: abortController.signal,
                }
              );
              const result = response.choices[0].message.content ?? '';
              const extractJsonResult = extractJSON(result);
              get().updateCase(targetCase.id, { result, extractJsonResult });
            }
          },

          _beforeCallLLM() {
            const apiKeySet = get().isApiKeySetOnServerSide || get().config.apiKey !== '';
            if (!apiKeySet) {
              notifications.show({
                color: 'red',
                message: 'You have to set your API Key first.',
                autoClose: 5_000,
              });
            } else {
              set({
                isCallingLLM: true,
              });
            }
            const prompt = getItem(get().selectedPromptId, get().prompts);
            const snapshot = getItem(get().selectedSnapshotId, get().snapshots);
            return { prompt, snapshot };
          },

          cancelCallLLM() {
            const abortController = get().callingLLMAbortController;
            if (abortController) {
              abortController.abort();
            }
            notifications.show({
              color: 'gray',
              message: 'Request to LLM canceled.',
              autoClose: 5_000,
            });
            set({
              loadingCaseId: null,
              isCallingLLM: false,
              callingLLMAbortController: null,
            });
          },

          async checkServerSideConfig() {
            const response = await fetch('api/config', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            const { hasApiKey, hasApiVersion } = await response.json();
            if (!hasApiKey && !get().config.apiKey) {
              notifications.show({
                color: 'red',
                message: 'You have to set your API Key first.',
              });
            }
            set({
              isApiKeySetOnServerSide: hasApiKey,
              isApiVersionSet: hasApiVersion,
            });
          },

          downloadCSV() {
            const prompt = getItem(get().selectedPromptId, get().prompts);
            const snapshot = getItem(get().selectedSnapshotId, get().snapshots);
            if (!prompt || !snapshot) {
              return;
            }
            const headers = ['prompt', ...prompt.promptVariableNames, 'result', 'json'];
            const values = snapshot.cases.map((c) => {
              const userPrompt = replacePromptVariables(
                prompt.promptText,
                prompt.promptVariableNames,
                c.variableValues
              );
              const variables = prompt.promptVariableNames.map((name) => {
                const v = c.variableValues.find((x) => x.name === name);
                return v?.value ?? '';
              });
              return [userPrompt, ...variables, c.result, c.extractJsonResult];
            });

            const csv = stringify([headers, ...values], {
              bom: true,
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const objectUrl = URL.createObjectURL(blob);
            const anchorElement = document.createElement('a');
            const fileName = `${prompt.name}_${dayjs(snapshot.recordedAt ?? new Date()).format(
              'YYYY-MM-DDTHH-mm-ss'
            )}.csv`;
            anchorElement.href = objectUrl;
            anchorElement.download = fileName;
            anchorElement.click();
            anchorElement.remove();
          },
        };
      },
      {
        name: 'prompt-tester-status',
      }
    )
  )
);
