import { GithubStorage } from "github-store"
import { MugunStore } from "mugun-store"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { Storage } from "@plasmohq/storage"

import * as bookmark from "~chrome-utils/bookmark"
import { StorageServerValue } from "~constants"
import {
  DefaultStorageKey,
  getStorage,
  GithubStorageKey,
  StorageServer
} from "~storage"
import type { BrowserType } from "api-types"
import { detectBrowser } from "~utils/browser"

export interface BookmarkRemoveByUrlRequestBody {
  url: string
}

export interface BookmarkRemoveByUrlResponseBody {
  status: "success" | "fail"
  message?: string
}

const removeByGithub = async (
  { instance, browserType}: { instance: Storage; browserType: BrowserType },
  { id }: { id: string }
): Promise<BookmarkRemoveByUrlResponseBody> => {
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
  })
  const result = await gs.removeBookmarkById({ id })
  return result
}
const removeByDefaultServer = async (
  { instance, browserType }: { instance: Storage; browserType: BrowserType },
  { id }: { id: string }
): Promise<BookmarkRemoveByUrlResponseBody> => {
  const token = await instance.get(DefaultStorageKey.TOKEN)
  const ms = new MugunStore({ token, browserType })
  const result = await ms.removeBookmarkById({ id })
  return result
}

const handler: PlasmoMessaging.MessageHandler<
  BookmarkRemoveByUrlRequestBody,
  BookmarkRemoveByUrlResponseBody
> = async (req, res) => {
  const browserType = detectBrowser();
  const { url } = req.body
  const instance = getStorage()
  const storageServer = await instance.get(StorageServer)
  let result: BookmarkRemoveByUrlResponseBody = {
    status: "fail",
    message: "Storage service not set"
  }
  const browserBookmark = await bookmark.findBookmarkByUrl(url)
  if (storageServer === StorageServerValue.GITHUB) {
    result = await removeByGithub({ instance, browserType }, { id: browserBookmark.id })
  } else if (storageServer === StorageServerValue.DEFAULT_SERVER) {
    result = await removeByDefaultServer(
      { instance, browserType },
      { id: browserBookmark.id }
    )
  }

  if (result.status === "success") {
    await bookmark.removeBookmark(url)
  }

  res.send(result)
}

export default handler
