import type { BrowserType, IBookmark } from "api-types"
import { GithubStorage } from "github-store"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { Storage } from "@plasmohq/storage"

import { StorageServerValue, tabGroupFolder } from "~constants"
import {
  DefaultStorageKey,
  getStorage,
  GithubStorageKey,
  StorageServer
} from "~storage"
import { detectBrowser } from "~utils/browser"

export interface TabGroupGetRequestBody {}

export interface TabGroupGetResponseBody {
  status: "success" | "fail"
  message?: string
  data: {
    tabGroups: {
      [tabTitle: string]: IBookmark[]
    }
  }
}

const getFromGithubStorage = async ({
  instance,
  browserType
}: {
  instance: Storage
  browserType: BrowserType
}): Promise<TabGroupGetResponseBody> => {
  const email = await instance.get(GithubStorageKey.EMAIL)
  const token = await instance.get(GithubStorageKey.TOKEN)
  const owner = await instance.get(GithubStorageKey.OWNER)
  const repo = await instance.get(GithubStorageKey.REPO)

  const gs = new GithubStorage({
    token,
    repo,
    owner,
    email,
    storageFolder: tabGroupFolder,
    filename: "data.json",
    branch: "main",
    browserType
  })

  const { status, bookmarks } = await gs.getBookmarks()
  const tabGroupsMap = new Map<string, IBookmark[]>()
  for (const bookmark of bookmarks) {
    const tabGroupTitle = bookmark.tags.length === 1 && bookmark.tags[0].name
    if (!tabGroupTitle) {
      continue
    }

    if (!tabGroupsMap.has(tabGroupTitle)) {
      tabGroupsMap.set(tabGroupTitle, [bookmark])
    } else {
      const tabList = tabGroupsMap.get(tabGroupTitle)
      tabList.push(bookmark)
      tabGroupsMap.set(tabGroupTitle, tabList)
    }
  }

  const tabGroups = {}
  tabGroupsMap.forEach((value, key) => {
    tabGroups[key] = value
  })

  if (status === "success") {
    return {
      status,
      data: {
        tabGroups
      }
    }
  }

  return {
    status: "fail",
    data: { tabGroups: {} }
  }
}

const handler: PlasmoMessaging.MessageHandler<
  TabGroupGetRequestBody,
  TabGroupGetResponseBody
> = async (req, res) => {
  const browserType = detectBrowser()

  const instance = getStorage()
  const storageServer = await instance.get(StorageServer)

  let result: TabGroupGetResponseBody
  if (storageServer === StorageServerValue.GITHUB) {
    result = await getFromGithubStorage({ instance, browserType })
  } else if (storageServer === StorageServerValue.DEFAULT_SERVER) {
    result = {
      status: "fail",
      message: "Current not support!",
      data: { tabGroups: {} }
    }
  } else {
    // TODO: save local storage
  }

  res.send(result)
}

export default handler
