import type { BrowserType, IBookmark, ITagItem } from "api-types"
import { GithubStorage } from "github-store"
import { tabGroupFolder } from "~constants"

import {
  DefaultStorageKey,
  getStorage,
  GithubStorageKey,
  StorageServer,
  TAB_GROUP_MAP_KEY
} from "~storage"

const storage = getStorage()

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
    storageFolder: tabGroupFolder,
    filename: "data.json",
    branch: "main",
    browserType
  })
  const result = await gs.modifyBookmarkById({ id, newTags, title })
  return result
}

/**
 * listen tab group
 */
chrome.tabGroups.onUpdated.addListener(async (group) => {
  const tabGroupMap = await storage.get<{
    [groupId: number]: chrome.tabGroups.TabGroup
  }>(TAB_GROUP_MAP_KEY)
  console.info("tabGroupMap", tabGroupMap)
  if (tabGroupMap && tabGroupMap[group.id]) {
    const originalTabGroup = tabGroupMap[group.id]
    if (originalTabGroup.title !== group.title) {
    }
    console.info("originalTabGroup", originalTabGroup)
    console.info("currentTabGroup", group)
  }
})
