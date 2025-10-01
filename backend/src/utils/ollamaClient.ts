// backend/src/utils/ollamaClient.ts
import fetch from 'node-fetch';

export interface OllamaRequest {
  model: string;
  prompt: string;
  system?: string;
  stream?: boolean;
}

export class OllamaClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async generate(request: OllamaRequest): Promise<string> {
    try {
      console.log(`Calling Ollama with model: ${request.model}`);
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          prompt: request.prompt,
          system: request.system,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error('Ollama response missing "response" field');
      }
      
      console.log(`Ollama response received for ${request.model}`);
      return data.response;
    } catch (error) {
      console.error('Ollama API call failed:', error);
      throw error;
    }
  }

  async listModels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      return [];
    }
  }

  // Helper method to check if a specific model is available
  async isModelAvailable(modelName: string): Promise<boolean> {
    const models = await this.listModels();
    return models.some(model => 
      model.name === modelName || model.model === modelName
    );
  }
}
