import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { IBookmark, ITagItem } from "api-types";
import { GithubStorage } from 'github-store';
import { StorageKeyHash, getStorage } from '~storage';

export interface BookmarkUpdateRequestBody {
  // url: string;
  // tags?: ITagItem[];
  // title?: string;
  updatedBookmark: IBookmark;
}

export interface BookmarkUpdateResponseBody {
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
 
const handler: PlasmoMessaging.MessageHandler<BookmarkUpdateRequestBody, BookmarkUpdateResponseBody> = async (req, res) => {
  const { updatedBookmark } = req.body;
  console.info('updatedBookmark', updatedBookmark);
  const result = await updateBookmark({
    id: String(updatedBookmark.id),
    newTags: updatedBookmark.tags,
    title: updatedBookmark.title,
  });
 
  res.send(result);
}
 
export default handler