import { ComboboxItem } from '@mantine/core';
import dayjs from 'dayjs';
import {
  CallLLMRequest,
  Case,
  ModelIds,
  Prompt,
  PromptTesterConfig,
  Snapshot,
  VariableValue,
} from './type';

export const getItem: <TItem extends { id: string }>(
  itemId: string,
  list: TItem[]
) => TItem | null = (itemId, list) => list.find((x) => x.id === itemId) ?? null;

export const updateItemList: <TItem extends { id: string }>(
  list: TItem[],
  updateItemId: string,
  updateFn: (item: TItem) => TItem,
  isUpdateOrder?: boolean
) => TItem[] = (list, updateItemId, updateFn, isUpdateOrder = false) => {
  const currentItemIndex = list.findIndex((x) => x.id === updateItemId);
  if (currentItemIndex < 0) {
    return list;
  }
  const currentItem = list[currentItemIndex];
  const updatedItem = updateFn(currentItem);
  if (isUpdateOrder) {
    delete list[currentItemIndex];
    return [updatedItem, ...list.filter((x) => x)];
  }
  list[currentItemIndex] = updatedItem;
  return [...list];
};

export const itemListToSelectOptions: <TItem extends { id: string; name: string }>(
  itemList: TItem[]
) => ComboboxItem[] = (itemList) => itemList.map((x) => ({ label: x.name, value: x.id }));

export const snapshotListToSelectOptions: (snapshotList: Snapshot[]) => ComboboxItem[] = (
  snapshotList
) =>
  snapshotList.map((x) => {
    const label = x.recordedAt
      ? `${dayjs(x.recordedAt).format('YYYY-MM-DDTHH:mm:ss')} (ReadOnly)`
      : 'latest';
    return {
      label,
      value: x.id,
    };
  });

export const getValidVariableValues: (
  someCase: Case,
  validVariableNames: string[]
) => VariableValue[] = (someCase, validVariableNames) =>
  validVariableNames.map((x) => ({
    name: x,
    value: someCase.variableValues.find((v) => v.name === x)?.value ?? '',
  }));

const VariableNameRegex = /\{\{[^{}]+\}\}/g;
const ReplaceRegex = /[{}]/g;

export const getVariableNames: (promptText: string) => string[] = (promptText) => {
  const results = promptText.match(VariableNameRegex);
  if (!results) {
    return [];
  }

  return results.map((x) => x.replaceAll(ReplaceRegex, ''));
};

export const getCallLLMRequestBody: (
  prompt: Prompt,
  targetCase: Case,
  config: PromptTesterConfig
) => CallLLMRequest = (prompt, targetCase, config) => {
  const userPrompt = replacePromptVariables(
    prompt.promptText,
    prompt.promptVariableNames,
    targetCase.variableValues
  );
  return {
    config,
    request: {
      userPrompt,
      systemPrompt: prompt.systemPromptText,
      temperature: prompt.temperature,
      modelId: prompt.modelId as ModelIds,
    },
  };
};

export const replacePromptVariables: (
  promptText: string,
  variableNames: string[],
  variableValues: VariableValue[]
) => string = (promptText, variableNames, variableValues) => {
  let replacedPrompt = promptText;
  for (const name of variableNames) {
    const variableValue = variableValues.find((x) => x.name === name);
    if (!variableValue) {
      continue;
    }
    replacedPrompt = replacedPrompt.replaceAll(`{{${name}}}`, variableValue.value);
  }
  return replacedPrompt;
};

const startJsonSymbol = /(\{|\[)(\s|\{|\[)*/g;
const endJsonSymbol = /(\s|\}|\])*(\}|\])/g;

export const extractJSON: (llmOutput: string) => string = (llmOutput) => {
  const startSymbolMatches = Array.from(llmOutput.matchAll(startJsonSymbol));
  const endSymbolMatches = Array.from(llmOutput.matchAll(endJsonSymbol)).reverse();

  for (const s of startSymbolMatches) {
    const startIndex = s.index ?? 0;

    for (const e of endSymbolMatches) {
      const endIndex = (e.index ?? 0) + e[0].length;
      const maybeJsonStr = llmOutput.slice(startIndex, endIndex);
      try {
        return JSON.stringify(JSON.parse(maybeJsonStr), null, 2);
      } catch {
        /* empty */
      }
    }
  }

  return '';
};
