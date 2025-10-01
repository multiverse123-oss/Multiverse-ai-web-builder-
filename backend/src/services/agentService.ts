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
      // Primary: Use Qwen2.5 for planning
      const response = await this.ollama.generate({
        model: 'qwen2.5-coder',
        prompt: planPrompt,
        system: `You are an expert software architect. Output JSON array of steps: [{id, title, description, commands, files_to_change}]. Be minimal and precise.`
      });

      return this.parsePlanResponse(response);
    } catch (error) {
      console.warn('Qwen2.5 planning failed, falling back to StarCoder');
      const fallbackResponse = await this.ollama.generate({
        model: 'starcoder',
        prompt: planPrompt,
        system: 'Generate a development plan as JSON array.'
      });
      
      return this.parsePlanResponse(fallbackResponse);
    }
  }

  async executeStep(step: AgentStep, context: any): Promise<{ code: string; files: string[] }> {
    const codePrompt = this.buildCodePrompt(step, context);
    
    try {
      const response = await this.ollama.generate({
        model: 'qwen2.5-coder',
        prompt: codePrompt,
        system: `Output ONLY unified-diff patches. Include metadata header. Be precise and follow best practices.`
      });

      return this.extractCodeFromResponse(response);
    } catch (error) {
      console.warn('Qwen2.5 code generation failed, falling back to StarCoder');
      const fallbackResponse = await this.ollama.generate({
        model: 'starcoder',
        prompt: codePrompt
      });
      
      return this.extractCodeFromResponse(fallbackResponse);
    }
  }

  async performWebSearch(query: string): Promise<{ url: string; title: string; snippet: string }[]> {
    const searchPrompt = `Search the web for: ${query}. Return results as JSON array with url, title, snippet.`;
    
    try {
      const response = await this.ollama.generate({
        model: 'sam860/lucy:1.7b',
        prompt: searchPrompt,
        system: 'You are a web search specialist. Return accurate, cited information.'
      });

      return this.parseSearchResponse(response);
    } catch (error) {
      console.error('Lucy web search failed:', error);
      return [];
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
    
    Output JSON array only.
    `;
  }

  private buildCodePrompt(step: AgentStep, context: any): string {
    return `
    Step to execute: ${step.title}
    Description: ${step.description}
    Project Context: ${JSON.stringify(context)}
    
    Generate the code for this step. Focus on:
    - Clean, maintainable code
    - Proper error handling
    - Security best practices
    - Performance considerations
    
    Output unified-diff format only.
    `;
  }

  private parsePlanResponse(response: string): AgentStep[] {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;
      
      const steps = JSON.parse(jsonString);
      return steps.map((step: any, index: number) => ({
        id: step.id || `step-${index + 1}`,
        title: step.title || `Step ${index + 1}`,
        description: step.description || '',
        status: 'pending' as const,
        logs: [],
        filesChanged: step.files_to_change || step.filesChanged || []
      }));
    } catch (error) {
      console.error('Failed to parse AI plan response:', error);
      throw new Error('Failed to parse AI plan response: ' + error.message);
    }
  }

  private extractCodeFromResponse(response: string): { code: string; files: string[] } {
    try {
      // Extract code blocks or unified diff format
      const codeBlocks = response.match(/```(?:\w+)?\n([\s\S]*?)```/g);
      
      if (codeBlocks) {
        const code = codeBlocks.map(block => 
          block.replace(/```(?:\w+)?\n/, '').replace(/```$/, '')
        ).join('\n\n');
        
        // Extract file paths from the response
        const filePaths = response.match(/[a-zA-Z0-9_\-./]+\.(tsx|ts|jsx|js|css|html|json)/g) || [];
        
        return {
          code: code.trim(),
          files: [...new Set(filePaths)] // Remove duplicates
        };
      }
      
      // If no code blocks found, return the raw response
      return {
        code: response.trim(),
        files: []
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
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;
      
      const results = JSON.parse(jsonString);
      
      if (!Array.isArray(results)) {
        throw new Error('Search response is not an array');
      }
      
      return results.map((result: any) => ({
        url: result.url || '',
        title: result.title || 'No title',
        snippet: result.snippet || result.description || 'No description available'
      }));
    } catch (error) {
      console.error('Failed to parse search response:', error);
      // Return mock data as fallback
      return [
        {
          url: 'https://example.com',
          title: 'Example Search Result',
          snippet: 'This is a sample search result. The actual Lucy model should provide real web search data.'
        }
      ];
    }
  }
}
