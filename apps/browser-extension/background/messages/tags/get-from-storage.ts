import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { IBookmark, ITagItem } from "api-types";
import { GithubStorage } from 'github-store';
import { findBookmarkByUrl } from "~chrome-utils";
import { StorageKeyHash, getStorage } from '~storage';

export interface RequestBody {
  url: string;
}

export interface ResponseBody {
  tags: ITagItem[];
}

const getTags = async ({ id }: {id: string}) => {
  const instance = getStorage();
  const email = await instance.get(StorageKeyHash.EMAIL);
  const token = await instance.get(StorageKeyHash.TOKEN);
  const owner = await instance.get(StorageKeyHash.OWNER);
  const repo = await instance.get(StorageKeyHash.REPO);

  const gs = new GithubStorage({
    token,
    repo,
    owner,
    email,
    storageFolder: "favorites",
    filename: "data.json",
    branch: "main"
  });
  const result = await gs.getTagsByBookmarkId({ id });
  return result;
}
 
const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
  const { url } = req.body;
  const browserBookmark = await findBookmarkByUrl(url);
  const result = await getTags({
    id: browserBookmark.id,
  });
 
  res.send({ tags: result.tags });
}
 
export default handler