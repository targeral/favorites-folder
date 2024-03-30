import type { IBookmark, ITagItem } from "api-types"
import { GithubStorage } from "github-store"
import { MugunStore } from "mugun-store"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { Storage } from "@plasmohq/storage"

import { findBookmarkByUrl } from "~chrome-utils"
import { StorageServerValue } from "~constants"
import {
  DefaultStorageKey,
  getStorage,
  GithubStorageKey,
  StorageServer
} from "~storage"

export interface TagsGetRequestBody {
  url: string
}

export interface TagsGetResponseBody {
  status: "success" | "fail"
  message?: string
  data: {
    tags: ITagItem[]
  }
}

const getTagsByGithub = async (
  { instance }: { instance: Storage },
  { id }: { id: string }
): Promise<TagsGetResponseBody> => {
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
  })
  const { status, message, tags } = await gs.getTagsByBookmarkId({ id })
  return {
    status,
    message,
    data: {
      tags
    }
  }
}

const getTagsByDefaultServer = async (
  {
    instance
  }: {
    instance: Storage
  },
  { id }: { id: string }
): Promise<TagsGetResponseBody> => {
  const token = await instance.get(DefaultStorageKey.TOKEN)
  const ms = new MugunStore({ token })
  const {
    status,
    data: { bookmarks }
  } = await ms.getBookmarks()
  const foundBookmark = bookmarks.find((bookmark) => String(bookmark.id) === String(id))
  if (status === "success" && foundBookmark) {
    return {
      status,
      data: {
        tags: foundBookmark.tags
      }
    }
  }

  return {
    status: "fail",
    message: "Fail to get tags",
    data: {
      tags: []
    }
  }
}

const handler: PlasmoMessaging.MessageHandler<
  TagsGetRequestBody,
  TagsGetResponseBody
> = async (req, res) => {
  const { url } = req.body
  const instance = getStorage()
  const storageServer = await instance.get(StorageServer)
  const browserBookmark = await findBookmarkByUrl(url)

  let result: TagsGetResponseBody = {
    status: 'fail',
    message: 'Storage service not set',
    data: { tags: [] }
  };
  if (storageServer === StorageServerValue.GITHUB) {
    result = await getTagsByGithub({ instance }, { id: browserBookmark.id })
  } else if (storageServer === StorageServerValue.DEFAULT_SERVER) {
    result = await getTagsByDefaultServer({ instance }, { id: browserBookmark.id })
  }

  res.send(result)
}

export default handler
