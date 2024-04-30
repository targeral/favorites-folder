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

const getAllTabsFromGroupId = async ({ groupId }: { groupId: number }) => {
  const allTabs = await chrome.tabs.query({})
  const tabs = allTabs.filter((tab) => tab.groupId === groupId)
  return tabs
}

const saveByGithubStorage = async (
  { instance, browserType }: { instance: Storage; browserType: BrowserType },
  { tabGroupBookmarks, tabGroupTitle }: { tabGroupBookmarks: IBookmark[]; tabGroupTitle: string }
): Promise<TabGroupSaveResponseBody> => {
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
    filename: `${tabGroupTitle}.json`,
    branch: "main",
    browserType
  })

  const result = await gs.addBookmarks(tabGroupBookmarks)
  
  if (result.status === "fail" && result.error.includes("未获取")) {
    const { status, message } = await gs.initStorage()
    if (status === "success") {
      return await gs.addBookmarks(tabGroupBookmarks)
    } else {
      return { status: "fail", message }
    }
  }

  return result;
}

export interface TabGroupSaveRequestBody {
  groupId: number
}

export interface TabGroupSaveResponseBody {
  status: "success" | "fail"
  message?: string
}

const handler: PlasmoMessaging.MessageHandler<
  TabGroupSaveRequestBody,
  TabGroupSaveResponseBody
> = async (req, res) => {
  const { groupId } = req.body ?? {}
  const browserType = detectBrowser()
  const tabs = await getAllTabsFromGroupId({ groupId })
  const tabGroupInfo = await chrome.tabGroups.get(groupId)
  console.info(tabs)
  const tabGroupBookmarks: IBookmark[] = tabs.map((tab) => ({
    browserType,
    title: tab.title,
    url: tab.url,
    tags: [],
    id: tab.id,
    dateAdded: new Date().valueOf()
  }))
  console.info(tabGroupBookmarks)

  const instance = getStorage()
  const storageServer = await instance.get(StorageServer)

  let result: TabGroupSaveResponseBody
  if (storageServer === StorageServerValue.GITHUB) {
    result = await saveByGithubStorage(
      { instance, browserType },
      { tabGroupBookmarks, tabGroupTitle: tabGroupInfo.title }
    )
  } else if (storageServer === StorageServerValue.DEFAULT_SERVER) {
    result = {
      status: "fail",
      message: "Current not support!"
    }
  } else {
    // TODO: save local storage
  }

  res.send(result)
}

export default handler
