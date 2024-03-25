import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { IBookmark, ITagItem } from "api-types";
import { GithubStorage } from 'github-store';
import { findBookmarkByUrl } from "~chrome-utils";
import * as bookmark from '~chrome-utils/bookmark';
import * as tab from '~chrome-utils/tab';
import { GithubStorageKey, getStorage } from '~storage';

const addBookmarkByGithubStorage = async (bookmark: IBookmark) => {
  const instance = getStorage();
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
  const result = await gs.addBookmark(bookmark);
  return result;
}

const addBookmark = async (bookmark: IBookmark) => {
  // TODO: 根据设置判断使用哪个 Storage
  return await addBookmarkByGithubStorage(bookmark);
}

export interface RequestBody {
  tags: ITagItem[];
}

export interface ResponseBody {
  status: 'success' | 'fail';
  message?: string;
}
 
const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
  const { tags } = req.body;
  const currentTab = await tab.getCurrentActiveTab();
  // 在浏览器中添加书签
  await bookmark.createBookmark(currentTab);
  // 添加成功后，更改图标为激活状态
  await chrome.action.setIcon({ path: chrome.runtime.getURL("resources/icon-active.png"), tabId: currentTab.id })

  // 同步后端数据
  const bookmarkData = await findBookmarkByUrl(currentTab.url);
  const result = await addBookmark({
    id: bookmarkData.id,
    title: bookmarkData.title,
    tags,
    url: bookmarkData.url,
    dateAdded: bookmarkData.dateAdded
  });
 
  res.send(result);
}
 
export default handler