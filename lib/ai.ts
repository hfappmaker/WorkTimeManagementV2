import axios from 'axios';

interface OllamaConfig {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export async function generateWithOllama(
  prompt: string,
  config: OllamaConfig = {
    model: 'deepseek-coder:latest',
    temperature: 0.7,
    max_tokens: 2048
  }
): Promise<string> {
  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: config.model,
      prompt: prompt,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    return response.data.response;

  } catch (error) {
    console.error('Error calling Ollama API:', error);
    throw error;
  }
}

// 使用例：
// const response = await generateWithOllama("Write a function that sorts an array");
// console.log(response);
