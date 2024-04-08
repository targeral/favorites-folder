import type { BrowserType, IBookmark, ITagItem } from "api-types"
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
import { detectBrowser } from "~utils/browser"

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
  { instance, browserType }: { instance: Storage; browserType: BrowserType; },
  { url }: { url: string }
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
    branch: "main",
    browserType
  })
  const { status, message, tags } = await gs.getTagsByUrl({ url })
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
    instance,
    browserType
  }: {
    instance: Storage;
    browserType: BrowserType;
  },
  { url }: { url: string }
): Promise<TagsGetResponseBody> => {
  const token = await instance.get(DefaultStorageKey.TOKEN)
  const ms = new MugunStore({ token, browserType })
  const {
    status,
    data: { tags }
  } = await ms.getTagsByUrl({ url });
  if (status === "success") {
    return {
      status,
      data: {
        tags
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
  const browserType = detectBrowser();
  const instance = getStorage()
  const storageServer = await instance.get(StorageServer)
  const browserBookmark = await findBookmarkByUrl(url)

  let result: TagsGetResponseBody = {
    status: 'fail',
    message: 'Storage service not set',
    data: { tags: [] }
  };
  if (storageServer === StorageServerValue.GITHUB) {
    result = await getTagsByGithub({ instance, browserType }, { url: browserBookmark.url })
  } else if (storageServer === StorageServerValue.DEFAULT_SERVER) {
    result = await getTagsByDefaultServer({ instance, browserType }, { url: browserBookmark.url })
  }

  res.send(result)
}

export default handler
