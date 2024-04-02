import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { Storage } from "@plasmohq/storage";
import type { IBookmark, ITagItem } from "api-types";
import { GithubStorage } from 'github-store';
import { MugunStore } from 'mugun-store';

import { findBookmarkByUrl } from "~chrome-utils";
import * as bookmark from '~chrome-utils/bookmark';
import * as tab from '~chrome-utils/tab';

import { StorageServerValue } from "~constants"
import { getStorage, GithubStorageKey, StorageServer, DefaultStorageKey } from "~storage"

export interface BookmarkAddRequestBody {
  tags: ITagItem[];
}

export interface BookmarkAddResponseBody {
  status: 'success' | 'fail';
  message?: string;
}

const addBookmarkByGithubStorage = async ({ instance }: { instance: Storage }, bookmark: IBookmark): Promise<BookmarkAddResponseBody> => {
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
    branch: "main"
  });
  const result = await gs.addBookmarks([bookmark]);
  return result;
}

const addBookmarkByDefaultServer = async ({ instance }: { instance: Storage }, bookmark: IBookmark): Promise<BookmarkAddResponseBody> => {
  const token = await instance.get(DefaultStorageKey.TOKEN)
  const ms = new MugunStore({ token });
  const result = await ms.addBookmarks([bookmark]);
  return result;
}
 
const handler: PlasmoMessaging.MessageHandler<BookmarkAddRequestBody, BookmarkAddResponseBody> = async (req, res) => {
  const { tags } = req.body;
  const instance = getStorage()
  const storageServer = await instance.get(StorageServer)
  const currentTab = await tab.getCurrentActiveTab();
  // 在浏览器中添加书签
  await bookmark.createBookmark(currentTab);
  // 添加成功后，更改图标为激活状态
  await chrome.action.setIcon({ path: chrome.runtime.getURL("resources/icon-active.png"), tabId: currentTab.id })

  // 同步后端数据
  const bookmarkData = await findBookmarkByUrl(currentTab.url);
  let result: BookmarkAddResponseBody = {
    status: 'fail',
    message: 'Storage service not set'
  };
  const newBookmark: IBookmark = {
    id: bookmarkData.id,
    title: bookmarkData.title,
    tags,
    url: bookmarkData.url,
    dateAdded: bookmarkData.dateAdded
  };
  if (storageServer === StorageServerValue.GITHUB) {
    result = await addBookmarkByGithubStorage({ instance }, newBookmark);
  } else if (storageServer === StorageServerValue.DEFAULT_SERVER) {
    result = await addBookmarkByDefaultServer({ instance }, newBookmark);
  }

  if (result.status === 'fail') {
    result.message = 'Fail to add a new bookmark';
  }
 
  res.send(result);
}
 
export default handler