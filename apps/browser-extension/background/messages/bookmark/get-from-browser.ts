import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { IBookmark, ITagItem } from "api-types";

const flattenBookmarks = (nodes: chrome.bookmarks.BookmarkTreeNode[], parentTitle = "") => {
    let flatList: IBookmark[] = []
    nodes.forEach((node) => {
      if (node.children) {
        flatList = flatList.concat(flattenBookmarks(node.children, node.title))
      } else if (node.url) {
        flatList.push({ dateAdded: node.dateAdded, title: node.title, url: node.url, id: node.id, tags: parentTitle ? [{name: parentTitle, source: "SYSTEM" }] : [] })
      }
    })
    return flatList
};

const sortBookmarksByDate = (bookmarks) => {
    return bookmarks.sort((a, b) => b.dateAdded - a.dateAdded) // Sort by date in descending order
};

const handler: PlasmoMessaging.MessageHandler = async (_, res) => {
    const bookmarkTreeNodes = await chrome.bookmarks.getTree();
    const flatBookmarks = flattenBookmarks(bookmarkTreeNodes);
    const sortedBookmarks = sortBookmarksByDate(flatBookmarks);

    res.send({ bookmarks: sortedBookmarks });
}
 
export default handler