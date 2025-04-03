"use server";

import { generateWithOllama } from "@/features/ai/lib/ai";
import { FormActionResult } from "@/types/form-action-result";

export const generateOllamaAction = async (
  prompt: string,
  aiModel: string,
): Promise<FormActionResult> => {
  const config = {
    model: aiModel,
    temperature: 0.7,
    max_tokens: 2048,
  };

  return await generateWithOllama(prompt, config);
};
