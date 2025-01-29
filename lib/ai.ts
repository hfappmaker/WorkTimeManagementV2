import { spawn } from 'child_process';

interface DeepSeekConfig {
  model: string;
  temperature?: number;
  max_tokens?: number;
}

export async function generateWithDeepseek(
  prompt: string, 
  config: DeepSeekConfig = {
    model: 'deepseek-coder-6.7b',
    temperature: 0.7,
    max_tokens: 2048
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn('python', [
      '-c',
      `
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

def generate_response(prompt, model_name, temperature=0.7, max_tokens=2048):
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16,
        device_map="auto"
    )
    
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(
        **inputs,
        max_new_tokens=max_tokens,
        temperature=temperature,
        do_sample=True
    )
    
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

result = generate_response(
    """${prompt}""", 
    "${config.model}",
    ${config.temperature},
    ${config.max_tokens}
)
print(result)
      `
    ]);

    let output = '';
    let error = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      error += data.toString();
    });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}\nError: ${error}`));
      } else {
        resolve(output.trim());
      }
    });
  });
}
