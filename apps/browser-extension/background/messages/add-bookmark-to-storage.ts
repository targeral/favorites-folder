import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { IBookmark } from "api-types";
import { GithubStorage } from 'github-store';
import { findBookmarkByUrl } from "~chrome-utils";
import { StorageKeyHash, getStorage } from '~storage'

const addBookmark = async (bookmark: IBookmark) => {
  const instance = getStorage();
  const email = await instance.get(StorageKeyHash.EMAIL);
  const token = await instance.get(StorageKeyHash.TOKEN);
  const owner = await instance.get(StorageKeyHash.OWNER);
  const repo = await instance.get(StorageKeyHash.REPO);
  console.info(email);

  const gs = new GithubStorage({
    token,
    repo,
    owner,
    email,
    storageFolder: "favorites",
    filename: "data.json",
    branch: "main"
  });
  const result = await gs.addBookmark(bookmark);
  return result;
}
 
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { url, tags } = req.body;
  const browserBookmark = await findBookmarkByUrl(url);
  const result = await addBookmark({
    id: browserBookmark.id,
    title: browserBookmark.title,
    tags,
    url,
  });
 
  res.send(result);
}
 
export default handler