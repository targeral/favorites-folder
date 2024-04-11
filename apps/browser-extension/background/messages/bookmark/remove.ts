import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { Storage } from "@plasmohq/storage"
import type { BrowserType, IBookmark } from "api-types"
import { GithubStorage } from "github-store"
import { MugunStore } from "mugun-store"

import * as browserBookmarkAPI from "~chrome-utils/bookmark"
import { StorageServerValue } from "~constants"
import {
  DefaultStorageKey,
  getStorage,
  GithubStorageKey,
  StorageServer
} from "~storage"
import { detectBrowser } from "~utils/browser"

export interface BookmarkRemoveRequestBody {
  bookmark: IBookmark;
}

export interface BookmarkRemoveResponseBody {
  status: "success" | "fail"
  message?: string
}

const removeByGithub = async (
  { instance, browserType }: { instance: Storage; browserType: BrowserType },
  { id }: { id: string }
): Promise<BookmarkRemoveResponseBody> => {
    const email = await instance.get(GithubStorageKey.EMAIL)
  const token = await instance.get(GithubStorageKey.TOKEN)
  const owner = await instance.get(GithubStorageKey.OWNER)
  const repo = await instance.get(GithubStorageKey.REPO)
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
  const result = await gs.removeBookmarkById({ id });
  return result;
}
const removeByDefaultServer = async (
  { instance, browserType }: { instance: Storage; browserType: BrowserType },
  { id }: { id: string }
): Promise<BookmarkRemoveResponseBody> => {
    const token = await instance.get(DefaultStorageKey.TOKEN)
  const ms = new MugunStore({ token, browserType })
  const result = await ms.removeBookmarkById({ id });
  return result;
}

const handler: PlasmoMessaging.MessageHandler<
  BookmarkRemoveRequestBody,
  BookmarkRemoveResponseBody
> = async (req, res) => {
  const { bookmark } = req.body
  const browserType = detectBrowser();
  const instance = getStorage()
  const storageServer = await instance.get(StorageServer)
  let result: BookmarkRemoveResponseBody = {
    status: 'fail',
    message: 'Storage service not set'
  };
  if (storageServer === StorageServerValue.GITHUB) {
    result = await removeByGithub({ instance, browserType }, { id: String(bookmark.id) })
  } else if (storageServer === StorageServerValue.DEFAULT_SERVER) {
    result = await removeByDefaultServer(
      { instance, browserType },
      { id: String(bookmark.id) }
    )
  }

  if (result.status === 'success' && browserBookmarkAPI.findBookmarkByUrl(bookmark.url)) {
    await browserBookmarkAPI.removeBookmark(bookmark.url);
  }
  
  res.send(result);
}

export default handler
