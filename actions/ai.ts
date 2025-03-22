"use server";

import { FormActionResult } from "@/models/form-action-result";
import { generateWithOllama } from "@/lib/ai";
import { getFormDataValue } from "@/types/attendance";

export const generateOllamaAction = async (
  _prevResult: FormActionResult,
  formData: FormData
): Promise<FormActionResult> => {
  const deepSeekPrompt = getFormDataValue(formData, "deepSeekPrompt");
  const aiModel = getFormDataValue(formData, "aiModel");

  const config = {
    model: aiModel,
    temperature: 0.7,
    max_tokens: 2048,
  };

  return await generateWithOllama(deepSeekPrompt, config);
}; 