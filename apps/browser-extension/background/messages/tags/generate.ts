import { SiteAnalyser } from "analysis-tags"
import type { ITagItem } from "api-types"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { Storage } from "@plasmohq/storage"

import { TagAIServerValue } from "~constants"
import { GeminiKey, getStorage, TagAIServer } from "~storage"

export interface TagsGenerateRequestBody {
  url: string
}

export interface TagsGenerateResponseBody {
  status: "success" | "fail"
  message?: string
  data: {
    tags: ITagItem[]
  }
}

const generateTagsByGemini = async (
  { instance }: { instance: Storage },
  { url }: { url: string }
): Promise<TagsGenerateResponseBody> => {
  const apiKey = await instance.get(GeminiKey.API_KEY);
  const model = await instance.get(GeminiKey.MODEL);
  console.info('model', model, apiKey);
  const analyser = new SiteAnalyser({ url })
  const { status, message, data: tags } = await analyser.analyzeByGemini({ apiKey, model })

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
  const { url } = req.body
  const instance = getStorage()
  const server = await instance.get(TagAIServer)
  let result: TagsGenerateResponseBody = {
    status: 'fail',
    data: {
      tags: [],
    },
    message: 'No matching AI service'
  };
  if (server === TagAIServerValue.GEMINI) {
    result = await generateTagsByGemini({ instance }, { url })
  }

  
  res.send(result);
}

export default handler
