import type { ITagItem } from 'api-types';
import { GenimiAnalyser, type GenimiAnalysisOptions } from './ai/gemini';
import { extractHtml } from './crawler';
import { MoonshotAnalyser, MoonshotAnalysisOptions } from './ai/moonshot';

export interface ISiteAnalyserOptions {
  url: string;
  tagMaxCount?: number;
}

export class SiteAnalyser {
  options: ISiteAnalyserOptions;

  constructor(options: ISiteAnalyserOptions) {
    this.options = options;
    this.options.tagMaxCount = this.options.tagMaxCount ?? 5;
  }

  async analyzeByGemini(options: GenimiAnalysisOptions): Promise<{
    status: 'success' | 'fail';
    data: ITagItem[];
    message?: string;
  }> {
    const ga = new GenimiAnalyser(options);
    const content = await this.#getWebsiteContent();
    const { data, error } = await ga.analysis(content, {
      tagsCount: this.options.tagMaxCount,
    });
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

  async analyzeByMoonshot(options: MoonshotAnalysisOptions): Promise<{
    status: 'success' | 'fail';
    data: ITagItem[];
    message?: string;
  }> {
    const moonshot = new MoonshotAnalyser(options);
    const content = await this.#getWebsiteContent();
    const { data, error } = await moonshot.analysis(content, {
      tagsCount: this.options.tagMaxCount,
    });

    if (error) {
      return {
        status: 'fail',
        data: [],
        message: error,
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
