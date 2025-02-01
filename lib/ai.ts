import axios from 'axios';

interface OllamaConfig {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export async function generateWithOllama(
  prompt: string,
  config: OllamaConfig = {
    // model: 'deepseek-coder:latest',
    model: 'hf.co/unsloth/DeepSeek-R1-Distill-Llama-8B-GGUF',
    // model: 'hf.co/mmnga/cyberagent-DeepSeek-R1-Distill-Qwen-32B-Japanese-gguf:latest',
    temperature: 0.7,
    max_tokens: 2048
  }
) {
  try {
    const response = await axios.post('http://ollama:11434/api/generate', {
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

    return { success : response.data.response };

  } catch (error) {
    return { error : 'Error calling Ollama API: ' + error};
  }
}

// 使用例：
// const response = await generateWithOllama("Write a function that sorts an array");
// console.log(response);
