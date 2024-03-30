import type { ITagItem } from 'api-types';
import { GenimiAnalyser, type GenimiAnalysisOptions } from './ai/gemini';
import { extractHtml } from './crawler';

export interface ISiteAnalyserOptions {
  url: string;
}

export class SiteAnalyser {
  options: ISiteAnalyserOptions;

  constructor(options: ISiteAnalyserOptions) {
    this.options = options;
  }

  async analyzeByGemini(options: GenimiAnalysisOptions): Promise<{
    status: 'success' | 'fail';
    data: ITagItem[];
    message?: string;
  }> {
    const ga = new GenimiAnalyser(options);
    const content = await this.#getWebsiteContent();
    const { data, error } = await ga.analysis(content);
    if (error) {
      return {
        status: 'fail',
        data: [],
      };
    }

    return {
      status: 'success',
      data: data.split(',').map(name => ({
        name,
        source: 'AI',
      })),
    };
  }

  async #getWebsiteContent() {
    const { url } = this.options;
    // console.info(`获取 ${url} 页面`);
    const content = await extractHtml(url);
    // console.info(content);
    return content;
  }
}
