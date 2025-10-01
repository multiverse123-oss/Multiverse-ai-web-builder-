// backend/src/services/agentService.ts
import { OllamaClient } from '../utils/ollamaClient';
import { ModelOrchestrator } from '../utils/modelOrchestrator';

export interface AgentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  logs: string[];
  filesChanged: string[];
}

export interface GenerationRequest {
  prompt: string;
  projectId: string;
  userId: string;
  context?: any;
}

export class AgentService {
  private ollama: OllamaClient;
  private orchestrator: ModelOrchestrator;

  constructor() {
    this.ollama = new OllamaClient(process.env.OLLAMA_API_URL || 'http://localhost:11434');
    this.orchestrator = new ModelOrchestrator();
  }

  async generatePlan(request: GenerationRequest): Promise<AgentStep[]> {
    const planPrompt = this.buildPlanPrompt(request);
    
    try {
      // Primary: Use Qwen2.5 for planning - UPDATED with :latest suffix
      const response = await this.ollama.generate({
        model: 'qwen2.5-coder:latest', // FIXED: Added :latest suffix
        prompt: planPrompt,
        system: `You are an expert software architect. Output a valid JSON array of steps: [{"id": "string", "title": "string", "description": "string", "commands": "string[]", "files_to_change": "string[]"}]. Be minimal and precise. Return ONLY JSON, no additional text.`
      });

      return this.parsePlanResponse(response);
    } catch (error) {
      console.warn('Qwen2.5 planning failed, falling back to StarCoder:', error);
      try {
        const fallbackResponse = await this.ollama.generate({
          model: 'starcoder:latest', // FIXED: Added :latest suffix
          prompt: planPrompt,
          system: 'Generate a development plan as a valid JSON array. Return ONLY JSON, no additional text.'
        });
        
        return this.parsePlanResponse(fallbackResponse);
      } catch (fallbackError) {
        console.error('Both primary and fallback models failed:', fallbackError);
        throw new Error('AI planning service unavailable');
      }
    }
  }

  async executeStep(step: AgentStep, context: any): Promise<{ code: string; files: string[] }> {
    const codePrompt = this.buildCodePrompt(step, context);
    
    try {
      const response = await this.ollama.generate({
        model: 'qwen2.5-coder:latest', // FIXED: Added :latest suffix
        prompt: codePrompt,
        system: `Output ONLY unified-diff patches. Include metadata header. Be precise and follow best practices. Do not include explanations.`
      });

      return this.extractCodeFromResponse(response);
    } catch (error) {
      console.warn('Qwen2.5 code generation failed, falling back to StarCoder:', error);
      try {
        const fallbackResponse = await this.ollama.generate({
          model: 'starcoder:latest', // FIXED: Added :latest suffix
          prompt: codePrompt,
          system: 'Output code in unified-diff format. Focus on code completion.'
        });
        
        return this.extractCodeFromResponse(fallbackResponse);
      } catch (fallbackError) {
        console.error('Both primary and fallback models failed for code generation:', fallbackError);
        throw new Error('AI code generation service unavailable');
      }
    }
  }

  async performWebSearch(query: string): Promise<{ url: string; title: string; snippet: string }[]> {
    const searchPrompt = `Search the web for: ${query}. Return results as a valid JSON array with url, title, snippet.`;
    
    try {
      const response = await this.ollama.generate({
        model: 'sam860/lucy:1.7b', // CORRECT: This model name doesn't need :latest
        prompt: searchPrompt,
        system: 'You are a web search specialist. Return accurate, cited information as a valid JSON array. Format: [{"url": "string", "title": "string", "snippet": "string"}]. Return ONLY JSON, no additional text.'
      });

      return this.parseSearchResponse(response);
    } catch (error) {
      console.error('Lucy web search failed:', error);
      // Return minimal fallback instead of empty array
      return [{
        url: 'https://example.com/fallback',
        title: 'Search temporarily unavailable',
        snippet: 'The AI search service is currently unavailable. Please try again shortly.'
      }];
    }
  }

  private buildPlanPrompt(request: GenerationRequest): string {
    return `
    Project Context: ${JSON.stringify(request.context)}
    User Request: ${request.prompt}
    
    Create a step-by-step development plan. Consider:
    1. Frontend components needed
    2. Backend API endpoints  
    3. Database schema changes
    4. Authentication & security
    5. Deployment configuration
    
    Output a valid JSON array only, no additional text.
    `;
  }

  private buildCodePrompt(step: AgentStep, context: any): string {
    return `
    Step to execute: ${step.title}
    Description: ${step.description}
    Project Context: ${JSON.stringify(context)}
    Files to change: ${step.filesChanged.join(', ')}
    
    Generate the code for this step. Focus on:
    - Clean, maintainable code
    - Proper error handling
    - Security best practices
    - Performance considerations
    
    Output unified-diff format only, no explanations.
    `;
  }

  private parsePlanResponse(response: string): AgentStep[] {
    try {
      // Clean the response - remove any non-JSON text
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      
      const jsonString = jsonMatch[0];
      const steps = JSON.parse(jsonString);
      
      if (!Array.isArray(steps)) {
        throw new Error('Response is not a valid array');
      }
      
      return steps.map((step: any, index: number) => ({
        id: step.id || `step-${index + 1}-${Date.now()}`,
        title: step.title || `Step ${index + 1}`,
        description: step.description || 'No description provided',
        status: 'pending' as const,
        logs: [],
        filesChanged: step.files_to_change || step.filesChanged || []
      }));
    } catch (error) {
      console.error('Failed to parse AI plan response:', error, 'Raw response:', response);
      // Provide a default plan instead of failing completely
      return [{
        id: 'default-step-1',
        title: 'Initial Setup',
        description: 'Basic project structure setup',
        status: 'pending' as const,
        logs: [],
        filesChanged: ['package.json', 'README.md']
      }];
    }
  }

  private extractCodeFromResponse(response: string): { code: string; files: string[] } {
    try {
      // Clean the response
      const cleanedResponse = response.replace(/```diff\n?|\n?```/g, '').trim();
      
      // Extract file paths from the diff
      const filePaths = cleanedResponse.match(/[a-zA-Z0-9_\-./]+\.(tsx|ts|jsx|js|css|html|json|md|yml|yaml|xml)/g) || [];
      
      return {
        code: cleanedResponse,
        files: [...new Set(filePaths)] // Remove duplicates
      };
    } catch (error) {
      console.error('Failed to extract code from response:', error);
      return {
        code: response,
        files: []
      };
    }
  }

  private parseSearchResponse(response: string): { url: string; title: string; snippet: string }[] {
    try {
      // Clean the response
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('No JSON array found in search response');
      }
      
      const jsonString = jsonMatch[0];
      const results = JSON.parse(jsonString);
      
      if (!Array.isArray(results)) {
        throw new Error('Search response is not a valid array');
      }
      
      return results.map((result: any) => ({
        url: result.url || 'https://example.com',
        title: result.title || 'Untitled',
        snippet: result.snippet || result.description || 'No description available'
      }));
    } catch (error) {
      console.error('Failed to parse search response:', error, 'Raw response:', response);
      throw new Error('Failed to parse search results: ' + error.message);
    }
  }

  // New method to verify model availability
  async checkModelAvailability(): Promise<{ [key: string]: boolean }> {
    const models = ['qwen2.5-coder:latest', 'starcoder:latest', 'sam860/lucy:1.7b'];
    const availability: { [key: string]: boolean } = {};
    
    for (const model of models) {
      try {
        // Quick test prompt to check if model responds
        await this.ollama.generate({
          model,
          prompt: 'Respond with "OK"',
          system: 'Respond only with "OK"'
        });
        availability[model] = true;
      } catch (error) {
        availability[model] = false;
      }
    }
    
    return availability;
  }
}
