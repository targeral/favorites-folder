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

export interface TagListRequestBody {
  keyword: string
}

export interface TagListResponseBody {
  status: "success" | "fail"
  message?: string
  data: {
    tags: ITagItem[]
  }
}

const getTagListByGithub = async (
  { instance, browserType }: { instance: Storage; browserType: BrowserType; },
  { keyword }: { keyword: string }
): Promise<TagListResponseBody> => {
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
  const { status, message, tags } = await gs.getTagsByKeyword({ keyword });
  console.info(tags);
  return {
    status,
    message,
    data: {
      tags
    }
  }
}

const getTagListByDefaultServer = async (
  {
    instance,
    browserType
  }: {
    instance: Storage;
    browserType: BrowserType;
  },
  { keyword }: { keyword: string }
): Promise<TagListResponseBody> => {
  const token = await instance.get(DefaultStorageKey.TOKEN)
  const ms = new MugunStore({ token, browserType })
  const {
    status,
    data: { tags }
  } = await ms.getTagsByKeyword({ keyword });
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
  TagListRequestBody,
  TagListResponseBody
> = async (req, res) => {
  const { keyword } = req.body
  const browserType = detectBrowser();
  const instance = getStorage()
  const storageServer = await instance.get(StorageServer)

  let result: TagListResponseBody = {
    status: 'fail',
    message: 'Storage service not set',
    data: { tags: [] }
  };
  if (storageServer === StorageServerValue.GITHUB) {
    result = await getTagListByGithub({ instance, browserType }, { keyword })
  } else if (storageServer === StorageServerValue.DEFAULT_SERVER) {
    result = await getTagListByDefaultServer({ instance, browserType }, { keyword })
  }

  res.send(result)
}

export default handler
