import { SiteAnalyser, type MoonshotModel } from "analysis-tags"
import type { BrowserType, ITagItem } from "api-types"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { Storage } from "@plasmohq/storage"

import { TagAIServerValue } from "~constants"
import { GeminiKey, getStorage, MoonshotKey, TagAIServer } from "~storage"
import { detectBrowser } from "~utils/browser"

export interface TagsGenerateRequestBody {
  url: string;
  count?: number;
}

export interface TagsGenerateResponseBody {
  status: "success" | "fail"
  message?: string
  data: {
    tags: ITagItem[]
  }
}

const generateTagsByGemini = async (
  { instance, browserType }: { instance: Storage; browserType: BrowserType },
  { url, count }: { url: string; count?: number }
): Promise<TagsGenerateResponseBody> => {
  const apiKey = await instance.get(GeminiKey.API_KEY);
  const model = await instance.get(GeminiKey.MODEL);
  console.info('model', model, apiKey);
  const analyser = new SiteAnalyser({ url, tagMaxCount: count, browserType })
  const { status, message, data: tags } = await analyser.analyzeByGemini({ apiKey, model })

  return {
    status,
    data: {
      tags,
    },
    message
  };
}

const generateTagsByMoonshot = async (
  { instance, browserType }: { instance: Storage; browserType: BrowserType },
  { url, count }: { url: string; count?: number }
): Promise<TagsGenerateResponseBody> => {
  const apiKey = await instance.get(MoonshotKey.API_KEY);
  // TODO: maybe check model value in site analyser
  const model = await instance.get(MoonshotKey.MODEL) as MoonshotModel;
  console.info('model', model, apiKey);
  const analyser = new SiteAnalyser({ url, tagMaxCount: count, browserType })
  const { status, message, data: tags } = await analyser.analyzeByMoonshot({ apiKey, model })

  return {
    status,
    data: {
      tags,
    },
    message
  };
}

const handler: PlasmoMessaging.MessageHandler<
  TagsGenerateRequestBody,
  TagsGenerateResponseBody
> = async (req, res) => {
  const { url, count } = req.body
  const instance = getStorage()
  const browserType = detectBrowser();
  const server = await instance.get(TagAIServer)
  let result: TagsGenerateResponseBody = {
    status: 'fail',
    data: {
      tags: [],
    },
    message: 'No matching AI service'
  };
  if (server === TagAIServerValue.GEMINI) {
    result = await generateTagsByGemini({ instance, browserType }, { url, count })
  } else if (server === TagAIServerValue.MOONSHOT) {
    result = await generateTagsByMoonshot({ instance, browserType }, { url, count });
  }

  
  res.send(result);
}

export default handler
