export class ModelOrchestrator {
  private availableModels = new Set(['qwen2.5-coder', 'starcoder', 'sam860/lucy:1.7b']);

  async getBestModelForTask(taskType: string): Promise<string> {
    switch (taskType) {
      case 'planning':
      case 'code_generation':
        return 'qwen2.5-coder';
      case 'web_search':
        return 'sam860/lucy:1.7b';
      case 'code_completion':
        return 'starcoder';
      default:
        return 'qwen2.5-coder';
    }
  }

  async checkModelAvailability(model: string): Promise<boolean> {
    // In a real implementation, you'd check if the model is loaded in Ollama
    return this.availableModels.has(model);
  }
}
