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
      const fallbackResponse = await this.ollama.generate({
        model: 'starcoder',
        prompt: codePrompt
      });
      
      return this.extractCodeFromResponse(fallbackResponse);
    }
  }

  async performWebSearch(query: string): Promise<{ url: string; title: string; snippet: string }[]> {
    const searchPrompt = `Search the web for: ${query}. Return results as JSON array with url, title, snippet.`;
    
    const response = await this.ollama.generate({
      model: 'sam860/lucy:1.7b',
      prompt: searchPrompt,
      system: 'You are a web search specialist. Return accurate, cited information.'
    });

    return this.parseSearchResponse(response);
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

  private parsePlanResponse(response: string): AgentStep[] {
    try {
      const steps = JSON.parse(response);
      return steps.map((step: any, index: number) => ({
        id: step.id || `step-${index + 1}`,
        title: step.title,
        description: step.description,
        status: 'pending' as const,
        logs: [],
        filesChanged: step.files_to_change || []
      }));
    } catch (error) {
      throw new Error('Failed to parse AI plan response');
    }
  }
}
