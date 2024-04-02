import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { IBookmark } from "api-types";

const flattenBookmarksWithTags = (nodes: chrome.bookmarks.BookmarkTreeNode[], parentTitle = "") => {
    let flatList: IBookmark[] = []
    nodes.forEach((node) => {
      if (node.children) {
        flatList = flatList.concat(flattenBookmarksWithTags(node.children, node.title))
      } else if (node.url) {
        flatList.push({ dateAdded: node.dateAdded, title: node.title, url: node.url, id: node.id, tags: parentTitle ? [{name: parentTitle, source: "SYSTEM" }] : [] })
      }
    })
    return flatList
};

const flattenBookmarks = (nodes: chrome.bookmarks.BookmarkTreeNode[]) => {
  let flatList: IBookmark[] = []
  nodes.forEach((node) => {
    if (node.children) {
      flatList = flatList.concat(flattenBookmarks(node.children))
    } else if (node.url) {
      flatList.push({ dateAdded: node.dateAdded, title: node.title, url: node.url, id: node.id, tags: [] })
    }
  })
  return flatList
};

const sortBookmarksByDate = (bookmarks: IBookmark[]): IBookmark[] => {
    return bookmarks.sort((a, b) => b.dateAdded - a.dateAdded) // Sort by date in descending order
};

export interface GetBookmarksFromBrowserRequest {
  withFolderTag?: boolean;
}
export interface GetBookmarksFromBrowserResponse {
  status: 'success' | 'fail';
  message?: string;
  bookmarks: IBookmark[];
}

const handler: PlasmoMessaging.MessageHandler<GetBookmarksFromBrowserRequest, GetBookmarksFromBrowserResponse> = async (req, res) => {
    const { withFolderTag } = req.body ?? {}; // NB: need ??
    try {
      const bookmarkTreeNodes = await chrome.bookmarks.getTree();
      const flatBookmarks = withFolderTag ? flattenBookmarksWithTags(bookmarkTreeNodes) : flattenBookmarks(bookmarkTreeNodes);
      const sortedBookmarks = sortBookmarksByDate(flatBookmarks);
      res.send({ bookmarks: sortedBookmarks, status: 'success' });
    } catch(e) {
      res.send({ bookmarks: [], status: 'fail', message: JSON.stringify(e) });
    }
}
 
export default handler