import type { BrowserType, IBookmark } from "api-types"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import { detectBrowser } from "~utils/browser"

const flattenBookmarksWithTags = (
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  {
    parentTitle = "",
    browserType
  }: { parentTitle?: string; browserType: BrowserType }
) => {
  let flatList: IBookmark[] = []
  nodes.forEach((node) => {
    if (node.children) {
      flatList = flatList.concat(
        flattenBookmarksWithTags(node.children, {
          parentTitle: node.title,
          browserType
        })
      )
    } else if (node.url) {
      flatList.push({
        dateAdded: node.dateAdded,
        title: node.title,
        url: node.url,
        id: node.id,
        tags: parentTitle
          ? [{ name: parentTitle, source: "SYSTEM", browserType }]
          : [],
        browserType
      })
    }
  })
  return flatList
}

const flattenBookmarks = (
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  { browserType }: { browserType: BrowserType }
) => {
  let flatList: IBookmark[] = []
  nodes.forEach((node) => {
    if (node.children) {
      flatList = flatList.concat(
        flattenBookmarks(node.children, { browserType })
      )
    } else if (node.url) {
      flatList.push({
        dateAdded: node.dateAdded,
        title: node.title,
        url: node.url,
        id: node.id,
        tags: [],
        browserType
      })
    }
  })
  return flatList
}

const sortBookmarksByDate = (bookmarks: IBookmark[]): IBookmark[] => {
  return bookmarks.sort((a, b) => b.dateAdded - a.dateAdded) // Sort by date in descending order
}

export interface GetBookmarksFromBrowserRequest {
  withFolderTag?: boolean
}
export interface GetBookmarksFromBrowserResponse {
  status: "success" | "fail"
  message?: string
  bookmarks: IBookmark[]
}

const handler: PlasmoMessaging.MessageHandler<
  GetBookmarksFromBrowserRequest,
  GetBookmarksFromBrowserResponse
> = async (req, res) => {
  const { withFolderTag } = req.body ?? {} // NB: need ??
  const browserType = detectBrowser()
  try {
    const bookmarkTreeNodes = await chrome.bookmarks.getTree()
    const flatBookmarks = withFolderTag
      ? flattenBookmarksWithTags(bookmarkTreeNodes, { browserType })
      : flattenBookmarks(bookmarkTreeNodes, { browserType })
    const sortedBookmarks = sortBookmarksByDate(flatBookmarks)
    res.send({ bookmarks: sortedBookmarks, status: "success" })
  } catch (e) {
    res.send({ bookmarks: [], status: "fail", message: JSON.stringify(e) })
  }
}

export default handler
