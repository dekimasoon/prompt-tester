import { ComboboxItem } from '@mantine/core';
import { CallLLMRequest, Case, ModelIds, Prompt, Snapshot, VariableValue } from './type';
import dayjs from 'dayjs';

export const getItem: <TItem extends { id: string }>(
  itemId: string,
  list: TItem[]
) => TItem | null = (itemId, list) => {
  return list.find((x) => x.id === itemId) ?? null;
};

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
    return [updatedItem, ...list];
  }
  list[currentItemIndex] = updatedItem;
  return [...list];
};

export const itemListToSelectOptions: <TItem extends { id: string; name: string }>(
  itemList: TItem[]
) => ComboboxItem[] = (itemList) => {
  return itemList.map((x) => ({ label: x.name, value: x.id }));
};

export const snapshotListToSelectOptions: (snapshotList: Snapshot[]) => ComboboxItem[] = (
  snapshotList
) => {
  return snapshotList.map((x) => {
    const label = x.recordedAt ? dayjs(x.recordedAt).format('YYYY-MM-DD:HH:mm:ss') : 'latest';
    return {
      label,
      value: x.id,
    };
  });
};

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

export const getCallLLMRequestBodies: (
  prompt: Prompt,
  snapshot: Snapshot
) => { body: CallLLMRequest; caseId: string }[] = (prompt, snapshot) => {
  return snapshot.cases.map((x) => {
    const userPrompt = replacePromptVariables(
      prompt.promptText,
      prompt.promptVariableNames,
      x.variableValues
    );
    return {
      body: {
        userPrompt,
        systemPrompt: prompt.systemPromptText,
        temperature: prompt.temperature,
        modelId: prompt.modelId as ModelIds,
      },
      caseId: x.id,
    };
  });
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
