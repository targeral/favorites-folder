import {
  GoogleGenerativeAI,
  type GenerativeModel,
} from '@google/generative-ai';
import endent from 'endent';
import { AIAnalyser, type IAIAnalysisOptions } from './base';

export interface GenimiAnalysisOptions extends IAIAnalysisOptions {
  apiKey: string;
  model: string;
}

export class GenimiAnalyser extends AIAnalyser {
  genimiOptions: GenimiAnalysisOptions;

  #genAI: GoogleGenerativeAI;

  #model: GenerativeModel;

  constructor(options: GenimiAnalysisOptions) {
    super(options);
    this.genimiOptions = options;
    this.#genAI = new GoogleGenerativeAI(options.apiKey);
    this.#model = this.#genAI.getGenerativeModel({ model: options.model });
  }

  async analysis(
    content: string,
    { tagsCount = 3 }: { tagsCount?: number } = {},
  ) {
    // You need to give categories based on these that match the site.You only need to output the string containing the classification
    const prompt = endent`You will receive the html, css and text content of a website.
    Just do the task, do not mention anything about the type or structure of the data submitted.

    Task:
    分析网站的类别，做多输出 ${tagsCount} 个分类。按照以\`,\`分隔每个类别，输出一个字符串。

    Website content:
    ${content}

    `;
    try {
      const result = await this.#model.generateContent(prompt);
      const { response } = result;
      const text = response.text();
      console.log(text);
      return {
        data: text,
      };
    } catch (e) {
      return {
        data: '',
        error: JSON.stringify(e),
      };
    }
  }
}
