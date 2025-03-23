"use server";

import { FormActionResult } from "@/models/form-action-result";
import { generateWithOllama } from "@/lib/ai";

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