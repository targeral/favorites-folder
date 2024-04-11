import type { BrowserType, IBookmark, ITagItem } from "api-types"
import { GithubStorage } from "github-store"
import { MugunStore } from "mugun-store"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { Storage } from "@plasmohq/storage"

import { StorageServerValue } from "~constants"
import {
  DefaultStorageKey,
  getStorage,
  GithubStorageKey,
  StorageServer
} from "~storage"
import { detectBrowser } from "~utils/browser"

export interface BookmarkUpdateRequestBody {
  updatedBookmark: IBookmark
}

export interface BookmarkUpdateResponseBody {
  status: "success" | "fail"
  message?: string
}

const updateBookmarkFromGithub = async (
  { instance, browserType }: { instance: Storage; browserType: BrowserType },
  { id, newTags, title }: { id: string; newTags?: ITagItem[]; title?: string }
) => {
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
  const result = await gs.modifyBookmarkById({ id, newTags, title })
  return result
}

const updateBookmarkFromDefaultServer = async (
  {
    instance,
    browserType
  }: {
    instance: Storage;
    browserType: BrowserType;
  },
  updatedBookmark: IBookmark
) => {
  const token = await instance.get(DefaultStorageKey.TOKEN)
  const ms = new MugunStore({ token, browserType })
  const result = await ms.updateBookmark(updatedBookmark)
  return result
}

const handler: PlasmoMessaging.MessageHandler<
  BookmarkUpdateRequestBody,
  BookmarkUpdateResponseBody
> = async (req, res) => {
  const { updatedBookmark } = req.body
  const browserType = detectBrowser();
  console.info("updatedBookmark", updatedBookmark)
  const instance = getStorage()
  const storageServer = await instance.get(StorageServer)

  let result: BookmarkUpdateResponseBody = {
    status: 'fail',
    message: 'Storage service not set'
  };
  if (storageServer === StorageServerValue.GITHUB) {
    result = await updateBookmarkFromGithub(
      { instance, browserType },
      {
        id: String(updatedBookmark.id),
        newTags: updatedBookmark.tags,
        title: updatedBookmark.title
      }
    )
  } else if (storageServer === StorageServerValue.DEFAULT_SERVER) {
    result = await updateBookmarkFromDefaultServer({ instance, browserType }, updatedBookmark);
  }

  res.send(result)
}

export default handler
