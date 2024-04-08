import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { Storage } from "@plasmohq/storage";
import type { BrowserType, IBookmark } from "api-types";
import { GithubStorage } from 'github-store';
import { MugunStore } from 'mugun-store';

import { StorageServerValue } from "~constants"
import { getStorage, GithubStorageKey, StorageServer, DefaultStorageKey } from "~storage"
import { detectBrowser } from "~utils/browser";

export interface BookmarkBatchRequestBody {
  bookmarks: IBookmark[];
}

export interface BookmarkBatchResponseBody {
  status: 'success' | 'fail';
  message?: string;
}

const addBookmarkByGithubStorage = async ({ instance, browserType }: { instance: Storage; browserType: BrowserType }, bookmarks: IBookmark[]): Promise<BookmarkBatchResponseBody> => {
  const email = await instance.get(GithubStorageKey.EMAIL);
  const token = await instance.get(GithubStorageKey.TOKEN);
  const owner = await instance.get(GithubStorageKey.OWNER);
  const repo = await instance.get(GithubStorageKey.REPO);

  const gs = new GithubStorage({
    token,
    repo,
    owner,
    email,
    storageFolder: "favorites",
    filename: "data.json",
    branch: "main",
    browserType
  });
  const result = await gs.addBookmarks(bookmarks);
  return result;
}

const addBookmarkByDefaultServer = async ({ instance, browserType }: { instance: Storage; browserType: BrowserType }, bookmarks: IBookmark[]): Promise<BookmarkBatchResponseBody> => {
  const token = await instance.get(DefaultStorageKey.TOKEN)
  const ms = new MugunStore({ token, browserType });
  const result = await ms.addBookmarks(bookmarks);
  return result;
}
 
const handler: PlasmoMessaging.MessageHandler<BookmarkBatchRequestBody, BookmarkBatchResponseBody> = async (req, res) => {
  const { bookmarks } = req.body;
  const browserType = detectBrowser();
  const instance = getStorage()
  const storageServer = await instance.get(StorageServer)

  // 同步后端数据
  let result: BookmarkBatchResponseBody = {
    status: 'fail',
    message: 'Storage service not set'
  };
  if (storageServer === StorageServerValue.GITHUB) {
    result = await addBookmarkByGithubStorage({ instance, browserType }, bookmarks);
  } else if (storageServer === StorageServerValue.DEFAULT_SERVER) {
    result = await addBookmarkByDefaultServer({ instance, browserType }, bookmarks);
  }

  if (result.status === 'fail') {
    result.message = 'Fail to add some new bookmarks';
  }
 
  res.send(result);
}
 
export default handler