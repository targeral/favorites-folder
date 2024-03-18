import { GenimiAnalysis, type GenimiAnalysisOptions } from './ai/gemini';
import { extractHtml } from './crawler';

export interface ISiteAnalyerOptions {
  url: string;
}

export class SiteAnalyer {
  options: ISiteAnalyerOptions;

  constructor(options: ISiteAnalyerOptions) {
    this.options = options;
  }

  async analyzeByGemini(options: GenimiAnalysisOptions): Promise<string[]> {
    const ga = new GenimiAnalysis(options);
    const content = await this.#getWebsiteContent();
    const result = await ga.analysis(content);
    console.info('result', result);
    return result.split(',');
  }

  async #getWebsiteContent() {
    const { url } = this.options;
    console.info(`获取 ${url} 页面`);
    const content = await extractHtml(url);
    console.info(content);
    return content;
  }
}
