export interface IAIAnalysisOptions {
  name?: string;
}

export class AIAnalyser {
  options: IAIAnalysisOptions;

  constructor(options: IAIAnalysisOptions) {
    this.options = options;
  }

  async analysis(content: string): Promise<{ data: string; error?: string }> {
    return { data: content };
  }
}
