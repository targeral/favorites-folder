import ky from 'ky';
import endent from 'endent';
import { AIAnalyser, type IAIAnalysisOptions } from './base';

export type MoonshotModel =
  | 'moonshot-v1-8k'
  | 'moonshot-v1-32k'
  | 'moonshot-v1-128k';
export interface MoonshotAnalysisOptions extends IAIAnalysisOptions {
  apiKey: string;
  model: MoonshotModel;
}

export type Message = {
  role: 'system' | 'user';
  content: string;
};

export interface ChatCreateResponse {
  id: string;
  object: string;
  created: number;
  model: MoonshotModel;
  choices: {
    index: number;
    message: Message;
    finish_reason: string;
  }[];
  usage: {
    prompt_token: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class MoonshotAnalyser extends AIAnalyser {
  moonshotOptions: MoonshotAnalysisOptions;

  #baseUrl: string = 'https://api.moonshot.cn';

  #model: MoonshotModel;

  constructor(options: MoonshotAnalysisOptions) {
    super(options);
    this.moonshotOptions = options;
    this.#model = options.model;
  }

  async #chatCreate(messages: Message[]) {
    const url = `${this.#baseUrl}/v1/chat/completions`;
    const data: {
      model: MoonshotModel;
      messages: Message[];
      temperature: number;
    } = {
      model: this.#model,
      messages,
      temperature: 0.3,
    };
    const response = await ky.post(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.moonshotOptions.apiKey}`,
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(data),
    });
    return response.json<ChatCreateResponse>();
  }

  async analysis(
    content: string,
    { tagsCount = 3 }: { tagsCount?: number } = {},
  ) {
    // You need to give categories based on these that match the site.You only need to output the string containing the classification
    const prompt = endent`你将接收一个网站的 HTML、CSS 和文本内容，只需完成任务，不要提及所提交数据的类型或结构。

      任务:
      分析网站的类型，输出符合该网站类型的关键词，最多输出 ${tagsCount} 个。输出格式为：以\`,\`分隔每个关键词，输出一个字符串。注意除了关键词内容以外，不要有多余输出。

      网站内容:
      ${content}

      `;
    const messages: Message[] = [
      {
        role: 'system',
        content: prompt,
      },
    ];
    try {
      const result = await this.#chatCreate(messages);
      const { choices } = result;
      const text = choices[0].message.content;
      return {
        data: text,
      };
    } catch (e) {
      return {
        data: '',
        error: JSON.stringify((e as any).message),
      };
    }
  }
}
