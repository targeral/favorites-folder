import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { Storage } from "@plasmohq/storage"
import { GithubStorage } from "github-store"
import { MugunStore } from "mugun-store"

import { getCurrentActiveTab } from "~chrome-utils"
import * as bookmark from "~chrome-utils/bookmark"
import { StorageServerValue } from "~constants"
import {
  DefaultStorageKey,
  getStorage,
  GithubStorageKey,
  StorageServer
} from "~storage"

export interface BookmarkRemoveRequestBody {
  url: string
}

export interface BookmarkRemoveResponseBody {
  status: "success" | "fail"
  message?: string
}

const removeByGithub = async (
  { instance }: { instance: Storage },
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
    branch: "main"
  });
  const result = await gs.removeBookmarkById({ id });
  return result;
}
const removeByDefaultServer = async (
  { instance }: { instance: Storage },
  { id }: { id: string }
): Promise<BookmarkRemoveResponseBody> => {
    const token = await instance.get(DefaultStorageKey.TOKEN)
  const ms = new MugunStore({ token })
  const result = await ms.removeBookmarkById({ id });
  return result;
}

const handler: PlasmoMessaging.MessageHandler<
  BookmarkRemoveRequestBody,
  BookmarkRemoveResponseBody
> = async (req, res) => {
  const { url } = req.body
  const instance = getStorage()
  const storageServer = await instance.get(StorageServer)
  let result: BookmarkRemoveResponseBody = {
    status: 'fail',
    message: 'Storage service not set'
  };
  const browserBookmark = await bookmark.findBookmarkByUrl(url)
  if (storageServer === StorageServerValue.GITHUB) {
    result = await removeByGithub({ instance }, { id: browserBookmark.id })
  } else if (storageServer === StorageServerValue.DEFAULT_SERVER) {
    result = await removeByDefaultServer(
      { instance },
      { id: browserBookmark.id }
    )
  }

  if (result.status === 'success') {
    await bookmark.removeBookmark(url);
  }
  
  res.send(result);
}

export default handler
