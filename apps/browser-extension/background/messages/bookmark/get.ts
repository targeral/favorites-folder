import type { IBookmark } from "api-types"
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

const getBookmarksFromGithub = async ({
  instance
}: {
  instance: Storage
}): Promise<GetBookmarksResponseBody> => {
  const email = await instance.get(GithubStorageKey.EMAIL)
  const token = await instance.get(GithubStorageKey.TOKEN)
  const owner = await instance.get(GithubStorageKey.OWNER)
  const repo = await instance.get(GithubStorageKey.REPO)
  const initialized = await instance.get<boolean>(GithubStorageKey.INIT)

  const gs = new GithubStorage({
    token,
    repo,
    owner,
    email,
    storageFolder: "favorites",
    filename: "data.json",
    branch: "main"
  })
  let result: {
    status: "success" | "fail"
    message?: string
    bookmarks: IBookmark[]
  }
  if (initialized) {
    result = await gs.getBookmarks()
  } else {
    result = await gs.initStorage()
    if (result.status === "success") {
      await instance.set(GithubStorageKey.INIT, true);
    }
  }
  return {
    ...result,
    data: {
      bookmarks: result.bookmarks
    }
  }
}

const getBookmarksFromDefaultServer = async ({
  instance
}: {
  instance: Storage
}) => {
  const token = await instance.get(DefaultStorageKey.TOKEN)
  const ms = new MugunStore({ token })
  const result = await ms.getBookmarks()
  return result
}

export interface GetBookmarksRequestBody {}

export interface GetBookmarksResponseBody {
  status: "success" | "fail"
  message?: string
  data: {
    bookmarks: IBookmark[]
  }
}

const handler: PlasmoMessaging.MessageHandler<
  GetBookmarksRequestBody,
  GetBookmarksResponseBody
> = async (req, res) => {
  const instance = getStorage()
  const storageServer = await instance.get(StorageServer)

  let result: GetBookmarksResponseBody = {
    status: "fail",
    message: "Storage service not set",
    data: { bookmarks: [] }
  }
  if (storageServer === StorageServerValue.GITHUB) {
    result = await getBookmarksFromGithub({ instance })
  } else if (storageServer === StorageServerValue.DEFAULT_SERVER) {
    result = await getBookmarksFromDefaultServer({ instance })
  }

  res.send(result)
}

export default handler
