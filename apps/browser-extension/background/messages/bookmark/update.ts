import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { IBookmark, ITagItem } from "api-types";
import { GithubStorage } from 'github-store';
import { findBookmarkByUrl } from "~chrome-utils";
import { StorageKeyHash, getStorage } from '~storage';

export interface RequestBody {
  url: string;
  tags?: ITagItem[];
  title?: string;
}

export interface ResponseBody {
  status: 'success' | 'fail';
  message?: string;
}

const updateBookmark = async ({ id, newTags, title }: {id: string; newTags?: ITagItem[]; title?: string; }) => {
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
  const result = await gs.modifyBookmarkById({ id, newTags, title });
  return result;
}
 
const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
  const { url, tags: newTags, title } = req.body;
  const browserBookmark = await findBookmarkByUrl(url);
  const result = await updateBookmark({
    id: browserBookmark.id,
    newTags,
    title
  });
 
  res.send(result);
}
 
export default handler