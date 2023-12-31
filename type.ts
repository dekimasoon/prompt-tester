import { z } from 'zod';

export type PromptTesterConfig = {
  apiKey: string;
  apiBaseURL: string;
  apiVersion: string;
};

export type Prompt = {
  id: string;
  name: string;
  promptText: string;
  promptVariableNames: string[];
  modelId: string;
  temperature: number;
  systemPromptText: string;
};

export type VariableValue = {
  name: string;
  value: string;
};

export type Case = {
  id: string;
  variableValues: VariableValue[];
  result: string;
  extractJsonResult: string;
};

export type ArchiveSnapshot = {
  id: string;
  recordedAt: Date;
  promptId: string;
  promptWithoutName: Omit<Prompt, 'name'>;
  cases: Case[];
  isArchived: true;
};

export type EditingSnapshot = {
  id: string;
  recordedAt: null;
  promptId: string;
  promptWithoutName: null;
  cases: Case[];
  isArchived: false;
};

export type Snapshot = ArchiveSnapshot | EditingSnapshot;

export enum ModelIds {
  gpt35 = 'gpt35',
  gpt3516k = 'gpt35-16k',
  gpt4 = 'gpt4',
  gpt432k = 'gtp4-32k',
}

export type Model = {
  id: ModelIds;
  name: string;
  apiName: string;
};

export const Models: Model[] = [
  { id: ModelIds.gpt35, name: 'gpt-3.5-turbo', apiName: 'gpt-3.5-turbo' },
  { id: ModelIds.gpt3516k, name: 'gpt-3.5-turbo-16k', apiName: 'gpt-3.5-turbo-16k' },
  { id: ModelIds.gpt4, name: 'gpt-4', apiName: 'gpt-4' },
  { id: ModelIds.gpt432k, name: 'gpt-4-32k', apiName: 'gpt-4-32k' },
];

export const CallLLMRequestSchema = z.object({
  config: z
    .object({
      apiKey: z.string(),
      apiBaseURL: z.string(),
      apiVersion: z.string(),
    })
    .optional(),
  request: z
    .object({
      userPrompt: z.string().nonempty().trim(),
      systemPrompt: z.string().trim(),
      temperature: z.number().min(0).max(2),
      modelId: z.nativeEnum(ModelIds),
    })
    .required(),
});

export type CallLLMRequest = z.infer<typeof CallLLMRequestSchema>;
