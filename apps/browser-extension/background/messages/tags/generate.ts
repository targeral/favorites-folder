import type { PlasmoMessaging } from "@plasmohq/messaging";
import type { ITagItem } from 'api-types';
import { SiteAnalyer } from 'analysis-tags';

export interface RequestBody {
  url: string;
  apiKey: string;
}

export interface ResponseBody {
  tags: ITagItem[];
}

const getTags = async ({ websiteUrl, apiKey }: {websiteUrl: string; apiKey: string}): Promise<ITagItem[]> => {
    const sa = new SiteAnalyer({ url: websiteUrl });
    const tags = await sa.analyzeByGemini({ apiKey, model: 'gemini-pro' });

    return tags.map(tag => ({
      name: tag,
      source: 'AI'
    }));
}
 
const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
  const { url, apiKey } = req.body;
  const tags = await getTags({ websiteUrl: url, apiKey });
 
  res.send({
    tags
  });
}
 
export default handler