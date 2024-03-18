export interface IAIAnalysisOptions {
  name?: string;
}

export class AIAnalysis {
  options: IAIAnalysisOptions;

  constructor(options: IAIAnalysisOptions) {
    this.options = options;
  }

  async analysis(content: string): Promise<string> {
    return content;
  }
}
