import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { IBookmark, ITagItem } from "api-types";
import { GithubStorage } from 'github-store';
import { findBookmarkByUrl } from "~chrome-utils";
import { StorageKeyHash, getStorage } from '~storage'

const updateTags = async ({ id, newTags }: {id: string; newTags: ITagItem[]}) => {
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
  const result = await gs.modifyTagsByBookmarkId({ id, newTags });
  return result;
}
 
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { url, tags: newTags } = req.body;
  const browserBookmark = await findBookmarkByUrl(url);
  const result = await updateTags({
    id: browserBookmark.id,
    newTags
  });
 
  res.send(result);
}
 
export default handler